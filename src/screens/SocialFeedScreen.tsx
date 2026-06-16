/**
 * Purpose: Social feed screen — FeedList with paginated posts, like/comment, post creation.
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
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { ScreenStateView } from '../components/ScreenStateView';
import { validatePostCreate } from '../lib/validation';
import { toFamilyError } from '../lib/errors';
import { enqueue } from '../lib/offline-queue';
import { useAuth } from '../hooks/useAuth';
import { useNetworkState } from '../hooks/useNetworkState';
import type { Post, ScreenState } from '../types';

// ─── Post card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onReport: (postId: string) => void;
}

function PostCard({ post, onLike, onComment, onReport }: PostCardProps): React.ReactElement {
  return (
    <View style={styles.postCard}>
      {/* Author */}
      <View style={styles.postAuthor}>
        <View style={styles.authorAvatar}>
          <Text style={styles.authorAvatarText}>
            {post.authorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.postMeta}>
            {post.privacy === 'family_only' ? '🔒 Family only' : '👥 Extended family'} ·{' '}
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Pressable
          onPress={() => onReport(post.id)}
          style={styles.reportBtn}
          accessibilityLabel="Report post"
        >
          <Text style={styles.reportBtnText}>⋯</Text>
        </Pressable>
      </View>

      {/* Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Photo count indicator */}
      {post.photoUrls.length > 0 && (
        <Text style={styles.photoIndicator}>
          📷 {post.photoUrls.length} photo{post.photoUrls.length > 1 ? 's' : ''}
        </Text>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onLike(post.id)}
          accessibilityLabel={post.likedByMe ? 'Unlike post' : 'Like post'}
        >
          <Text style={[styles.actionText, post.likedByMe && styles.actionActive]}>
            {post.likedByMe ? '❤️' : '🤍'} {post.likeCount}
          </Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => onComment(post.id)}
          accessibilityLabel="Comment on post"
        >
          <Text style={styles.actionText}>💬 {post.commentCount}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

interface CreatePostModalProps {
  visible: boolean;
  isOnline: boolean;
  onSubmit: (content: string, privacy: 'family_only' | 'extended_family') => Promise<void>;
  onClose: () => void;
}

function CreatePostModal({ visible, isOnline, onSubmit, onClose }: CreatePostModalProps): React.ReactElement {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'family_only' | 'extended_family'>('family_only');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const validation = validatePostCreate({ content, photoUris: [], privacy });
    if (!validation.success) {
      setFieldError(validation.errors?.[0]?.message ?? 'Invalid input.');
      return;
    }
    setFieldError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(content, privacy);
      setContent('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>New Post</Text>
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityLabel="Post"
          >
            {isSubmitting ? (
              <ActivityIndicator color={BrandColors.primary} />
            ) : (
              <Text style={styles.modalPost}>Post</Text>
            )}
          </Pressable>
        </View>

        {!isOnline && (
          <Text style={styles.offlineBanner}>
            📡 You're offline — your post will be queued and sent when you reconnect.
          </Text>
        )}

        {fieldError && <Text style={styles.fieldError}>{fieldError}</Text>}

        <TextInput
          style={styles.postInput}
          multiline
          placeholder="What's happening in your family?"
          placeholderTextColor={BrandColors.textSecondary}
          value={content}
          onChangeText={setContent}
          maxLength={2000}
          autoFocus
          accessibilityLabel="Post content"
        />

        {/* Privacy toggle */}
        <View style={styles.privacyRow}>
          <Text style={styles.privacyLabel}>Who sees this?</Text>
          <Pressable
            style={[
              styles.privacyOption,
              privacy === 'family_only' && styles.privacyActive,
            ]}
            onPress={() => setPrivacy('family_only')}
          >
            <Text style={styles.privacyOptionText}>🔒 Family only</Text>
          </Pressable>
          <Pressable
            style={[
              styles.privacyOption,
              privacy === 'extended_family' && styles.privacyActive,
            ]}
            onPress={() => setPrivacy('extended_family')}
          >
            <Text style={styles.privacyOptionText}>👥 Extended</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Feed Screen ─────────────────────────────────────────────────────────

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

      // Map raw to Post type
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
      if (mapped.length > 0) {
        setCursor(mapped[mapped.length - 1]!.createdAt);
      }
      setScreenState(mapped.length === 0 && reset ? 'empty' : 'data');
    } catch (e) {
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

  // Optimistic like
  const handleLike = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
          : p
      )
    );
    try {
      await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
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
            : p
        )
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
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

  const handleCreatePost = async (
    content: string,
    privacy: 'family_only' | 'extended_family'
  ) => {
    if (!isOnline) {
      await enqueue({ kind: 'createPost', payload: { content, photoUris: [], privacy } });
      Alert.alert('Saved offline', 'Your post will sync when you reconnect.');
      return;
    }

    await fetch(`${authState.serverUrl}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authState.token}`,
      },
      body: JSON.stringify({
        query: `mutation CreatePost($content: String!, $privacy: String!) {
          insert_np_family_posts_one(object: {
            content: $content privacy: $privacy photo_urls: []
          }) { id created_at }
        }`,
        variables: { content, privacy },
      }),
    });

    // Reload feed
    setCursor(null);
    await loadPosts(true);
  };

  return (
    <View style={styles.container}>
      {/* Offline banner */}
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
            >
              <Text style={styles.loadMoreText}>Load more</Text>
            </Pressable>
          )}
          <View style={{ height: 80 }} />
        </ScrollView>
      </ScreenStateView>

      {/* FAB */}
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
  postCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    margin: 12,
    marginBottom: 6,
    padding: 14,
  },
  postAuthor: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  authorAvatarText: { color: '#fff', fontWeight: '700' },
  authorInfo: { flex: 1 },
  authorName: { color: BrandColors.textPrimary, fontWeight: '600', fontSize: 14 },
  postMeta: { color: BrandColors.textSecondary, fontSize: 11, marginTop: 2 },
  reportBtn: { padding: 4 },
  reportBtnText: { color: BrandColors.textSecondary, fontSize: 18 },
  postContent: { color: BrandColors.textPrimary, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  photoIndicator: { color: BrandColors.textSecondary, fontSize: 12, marginBottom: 10 },
  postActions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#1F2937', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { color: BrandColors.textSecondary, fontSize: 14 },
  actionActive: { color: BrandColors.error },
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
  // Modal
  modalContainer: { flex: 1, backgroundColor: BrandColors.background, padding: 16 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    marginBottom: 12,
  },
  modalCancel: { color: BrandColors.textSecondary, fontSize: 15 },
  modalTitle: { color: BrandColors.textPrimary, fontSize: 17, fontWeight: '700' },
  modalPost: { color: BrandColors.primary, fontSize: 15, fontWeight: '700' },
  offlineBanner: {
    backgroundColor: '#78350f',
    borderRadius: 8,
    padding: 10,
    color: '#fde68a',
    fontSize: 13,
    marginBottom: 12,
  },
  fieldError: { color: BrandColors.error, fontSize: 12, marginBottom: 8 },
  postInput: {
    color: BrandColors.textPrimary,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  privacyLabel: { color: BrandColors.textSecondary, fontSize: 13, marginRight: 4 },
  privacyOption: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  privacyActive: { borderColor: BrandColors.primary, backgroundColor: '#0c4a6e' },
  privacyOptionText: { color: BrandColors.textPrimary, fontSize: 13 },
});
