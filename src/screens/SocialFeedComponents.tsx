/**
 * Purpose: Sub-components for SocialFeedScreen — PostCard and CreatePostModal.
 *          Extracted from SocialFeedScreen.tsx to keep that file under 300 lines.
 *
 * Inputs:
 *   PostCard        — renders a single feed post with like / comment / report actions.
 *   CreatePostModal — modal for writing + submitting a new post with privacy selector.
 *
 * Outputs: Presentational components consumed by SocialFeedScreen.
 *
 * Constraints:
 *   - Privacy enforcement is server-side (Hasura RLS) — these components display
 *     the label but never enforce it themselves.
 *   - CreatePostModal holds its own local form state (content, privacy, error).
 *
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { validatePostCreate } from '../lib/validation';
import type { Post } from '../types';

// ─── PostCard ─────────────────────────────────────────────────────────────────

export interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onReport: (postId: string) => void;
}

export function PostCard({ post, onLike, onComment, onReport }: PostCardProps): React.ReactElement {
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

// ─── CreatePostModal ──────────────────────────────────────────────────────────

export interface CreatePostModalProps {
  visible: boolean;
  isOnline: boolean;
  onSubmit: (content: string, privacy: 'family_only' | 'extended_family') => Promise<void>;
  onClose: () => void;
}

export function CreatePostModal({
  visible,
  isOnline,
  onSubmit,
  onClose,
}: CreatePostModalProps): React.ReactElement {
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
      <View style={styles.modalContainer} accessibilityViewIsModal={true}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel new post">
            <Text style={styles.modalCancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>New Post</Text>
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityLabel="Post"
            accessibilityRole="button"
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
            style={[styles.privacyOption, privacy === 'family_only' && styles.privacyActive]}
            onPress={() => setPrivacy('family_only')}
            accessibilityRole="button"
            accessibilityLabel="Visible to family only"
            accessibilityState={{ selected: privacy === 'family_only' }}
          >
            <Text style={styles.privacyOptionText}>🔒 Family only</Text>
          </Pressable>
          <Pressable
            style={[styles.privacyOption, privacy === 'extended_family' && styles.privacyActive]}
            onPress={() => setPrivacy('extended_family')}
            accessibilityRole="button"
            accessibilityLabel="Visible to extended family"
            accessibilityState={{ selected: privacy === 'extended_family' }}
          >
            <Text style={styles.privacyOptionText}>👥 Extended</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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
