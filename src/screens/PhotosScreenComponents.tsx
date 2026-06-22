/**
 * Purpose: Sub-components for PhotosScreen — AlbumCard and CreateAlbumModal.
 *          Extracted from PhotosScreen.tsx to keep that file under 300 lines.
 *
 * Inputs:
 *   AlbumCard         — thumbnail card for a single photo album.
 *   CreateAlbumModal  — modal sheet for naming + creating a new album.
 *
 * Outputs: Presentational components consumed by PhotosScreen.
 *
 * Constraints:
 *   - AlbumCard is purely presentational (no local state).
 *   - CreateAlbumModal manages its own form state (title, submitting, error).
 *   - Album title validated via validateAlbumCreate before submit.
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
import { validateAlbumCreate } from '../lib/validation';
import type { PhotoAlbum } from '../types';

// ─── AlbumCard ────────────────────────────────────────────────────────────────

export interface AlbumCardProps {
  album: PhotoAlbum;
  onPress: () => void;
}

export function AlbumCard({ album, onPress }: AlbumCardProps): React.ReactElement {
  return (
    <Pressable
      style={styles.albumCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${album.title}, ${album.photoCount} photos`}
    >
      <View style={styles.albumCover}>
        <Text style={styles.albumCoverIcon}>📷</Text>
      </View>
      <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
      <Text style={styles.albumCount}>{album.photoCount} photos</Text>
    </Pressable>
  );
}

// ─── CreateAlbumModal ─────────────────────────────────────────────────────────

export interface CreateAlbumModalProps {
  visible: boolean;
  onSubmit: (title: string) => Promise<void>;
  onClose: () => void;
}

export function CreateAlbumModal({ visible, onSubmit, onClose }: CreateAlbumModalProps): React.ReactElement {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const result = validateAlbumCreate({ title });
    if (!result.success) {
      setError(result.errors?.[0]?.message ?? 'Invalid album name.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(title.trim());
      setTitle('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer} accessibilityViewIsModal={true}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel new album">
            <Text style={styles.modalCancel}>Cancel</Text>
          </Pressable>
          <Text style={styles.modalTitle}>New Album</Text>
          <Pressable onPress={handleSubmit} disabled={isSubmitting} accessibilityRole="button" accessibilityLabel="Create album">
            {isSubmitting
              ? <ActivityIndicator color={BrandColors.primary} />
              : <Text style={styles.modalAction}>Create</Text>}
          </Pressable>
        </View>
        {error && <Text style={styles.fieldError}>{error}</Text>}
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Album name"
          placeholderTextColor={BrandColors.textSecondary}
          autoFocus
          maxLength={100}
          accessibilityLabel="Album name"
        />
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  albumCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  albumCover: {
    height: 110,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumCoverIcon: { fontSize: 40 },
  albumTitle: {
    color: BrandColors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    padding: 10,
    paddingBottom: 2,
  },
  albumCount: {
    color: BrandColors.textSecondary,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  // Modal
  modalContainer: { flex: 1, backgroundColor: BrandColors.background, padding: 16 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    marginBottom: 20,
  },
  modalCancel: { color: BrandColors.textSecondary, fontSize: 15 },
  modalTitle: { color: BrandColors.textPrimary, fontSize: 17, fontWeight: '700' },
  modalAction: { color: BrandColors.primary, fontSize: 15, fontWeight: '700' },
  fieldError: { color: BrandColors.error, fontSize: 12, marginBottom: 8 },
  input: {
    backgroundColor: BrandColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    color: BrandColors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
