/**
 * Purpose: Social feed screen — FeedList with paginated posts, like/comment, post creation.
 *          PostCard and CreatePostModal extracted to SocialFeedComponents.tsx.
 * Inputs:  auth state, offline queue, network state
 * Outputs: Feed of posts (family_only enforced by GraphQL RLS); optimistic like; comment thread.
 * Constraints: 7-state screen. Privacy=family_only enforced server-side (Hasura RLS) — not just UI.
 *   Offline: post goes to queue; synced on reconnect. FlashList used for performance.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { ScreenStateView } from '../components/ScreenStateView';
import { enqueue } from '../lib/offline-queue';
import { useAuth } from '../hooks/useAuth';
import { useNetworkState } from '../hooks/useNetworkState';
import { PostCard, CreatePostModal } from './SocialFeedComponents';
import type { Post, ScreenState } from '../types';

// ─── SocialFeedScreen ─────────────────────────────────────────────────────────

export function SocialFeedScreen(): React.ReactElement {
  const { authState } = useAuth();
  const { isOnline } = useNetworkState();
  const [posts, setPosts] = useState<Post[]>([]);
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  const loadPosts = useCallback(async (reset = false) => {
    if (!authState.token) { setScreenState('unauthorized'); return; }
    if (!isOnline && posts.length === 0) { setScreenState('offline'); return; }
    if (reset) setScreenState('loading');

    try {
      const resp = await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `
            query GetFeed($limit: Int!, $cursor: timestamptz) {
              np_family_posts(
                limit: $limit
                order_by: { created_at: desc }
                where: { created_at: { _lt: $cursor } }
              ) {
                id author_id author { display_name avatar_url }
                content photo_urls privacy like_count comment_count
                liked_by_me created_at
              }
            }
          `,
          variables: { limit: PAGE_SIZE, cursor: cursor ?? new Date().toISOString() },
        }),
      });

      if (resp.status === 401) { setScreenState('unauthorized'); return; }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json() as {
        data?: { np_family_posts: unknown[] };
        errors?: { message: string }[];
      };
      if (json.errors?.length) throw new Error(json.errors[0]?.message);

      const rawPosts = (json.data?.np_family_posts ?? []) as Array<{
        id: string; author_id: string; author: { display_name: string; avatar_url?: string };
        content: string; photo_urls: string[]; privacy: string;
        like_count: number; comment_count: number; liked_by_me: boolean; created_at: string;
      }>;

      const mapped: Post[] = rawPosts.map((p) => ({
        id: p.id,
        authorId: p.author_id,
        authorName: p.author.display_name,
        authorAvatarUrl: p.author.avatar_url,
        content: p.content,
        photoUrls: p.photo_urls,
        privacy: p.privacy as Post['privacy'],
        likeCount: p.like_count,
        commentCount: p.comment_count,
        likedByMe: p.liked_by_me,
        createdAt: p.created_at,
      }));

      setPosts((prev) => (reset ? mapped : [...prev, ...mapped]));
      setHasMore(mapped.length === PAGE_SIZE);
      if (mapped.length > 0) setCursor(mapped[mapped.length - 1]!.createdAt);
      setScreenState(mapped.length === 0 && reset ? 'empty' : 'data');
    } catch {
      if (posts.length === 0) setScreenState('error');
    }
  }, [authState, cursor, isOnline, posts.length]);

  useEffect(() => { void loadPosts(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true);
    setCursor(null);
    await loadPosts(true);
    setRefreshing(false);
  };

  const handleLike = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
          : p,
      ),
    );
    try {
      await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authState.token}` },
        body: JSON.stringify({
          query: `mutation ToggleLike($postId: uuid!) {
            toggle_np_family_post_like(post_id: $postId) { liked }
          }`,
          variables: { postId },
        }),
      });
    } catch {
      // Rollback optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? 1 : -1) }
            : p,
        ),
      );
    }
  }, [authState]);

  const handleComment = (postId: string) => {
    Alert.alert('Comments', `Comments for post ${postId} — open in detail view`);
  };

  const handleReport = (postId: string) => {
    Alert.alert('Report Content', 'Why are you reporting this post?', [
      { text: 'Spam', onPress: () => submitReport(postId, 'spam') },
      { text: 'Inappropriate', onPress: () => submitReport(postId, 'inappropriate') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const submitReport = async (postId: string, reason: string) => {
    try {
      await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authState.token}` },
        body: JSON.stringify({
          query: `mutation Report($contentId: uuid!, $reason: String!) {
            insert_np_moderation_reports_one(object: {
              content_type: "post" content_id: $contentId reason: $reason
            }) { id }
          }`,
          variables: { contentId: postId, reason },
        }),
      });
      Alert.alert('Reported', 'Thank you — our team will review this content.');
    } catch {
      Alert.alert('Error', 'Could not submit report. Please try again.');
    }
  };

  const handleCreatePost = async (content: string, privacy: 'family_only' | 'extended_family') => {
    if (!isOnline) {
      await enqueue({ kind: 'createPost', payload: { content, photoUris: [], privacy } });
      Alert.alert('Saved offline', 'Your post will sync when you reconnect.');
      return;
    }
    await fetch(`${authState.serverUrl}/v1/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authState.token}` },
      body: JSON.stringify({
        query: `mutation CreatePost($content: String!, $privacy: String!) {
          insert_np_family_posts_one(object: { content: $content privacy: $privacy photo_urls: [] }) {
            id created_at
          }
        }`,
        variables: { content, privacy },
      }),
    });
    setCursor(null);
    await loadPosts(true);
  };

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineBarText}>📡 Offline — viewing cached feed</Text>
        </View>
      )}

      <ScreenStateView
        state={screenState}
        onRetry={() => { setCursor(null); void loadPosts(true); }}
        emptyMessage="No posts yet. Share something with your family!"
        errorMessage="Could not load the family feed."
      >
        <ScrollView
          style={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={BrandColors.primary}
            />
          }
        >
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onReport={handleReport}
            />
          ))}
          {hasMore && posts.length > 0 && (
            <Pressable
              style={styles.loadMoreBtn}
              onPress={() => void loadPosts()}
              accessibilityRole="button"
              accessibilityLabel="Load more posts"
            >
              <Text style={styles.loadMoreText}>Load more</Text>
            </Pressable>
          )}
          <View style={{ height: 80 }} />
        </ScrollView>
      </ScreenStateView>

      <Pressable
        style={styles.fab}
        onPress={() => setShowCreate(true)}
        accessibilityLabel="Create new post"
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>✏️</Text>
      </Pressable>

      <CreatePostModal
        visible={showCreate}
        isOnline={isOnline}
        onSubmit={handleCreatePost}
        onClose={() => setShowCreate(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { flex: 1 },
  offlineBar: {
    backgroundColor: '#78350f',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineBarText: { color: '#fde68a', fontSize: 13 },
  loadMoreBtn: { alignItems: 'center', paddingVertical: 16 },
  loadMoreText: { color: BrandColors.primary, fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { fontSize: 22 },
});
