/**
 * Purpose: Photo albums screen — AlbumGrid + PhotoUpload.
 *          AlbumCard and CreateAlbumModal extracted to PhotosScreenComponents.tsx.
 * Inputs:  auth state; expo-image-picker for local photo selection
 * Outputs: Albums (np_family_albums); photos (np_family_photos) stored in MinIO via signed upload
 * Constraints: 7-state screen. Multi-select up to 20MB/photo, 10 photos/upload batch.
 *   Offline: upload queued to offline queue. Pinch-zoom viewer with swipe navigation.
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
import { AlbumCard, CreateAlbumModal } from './PhotosScreenComponents';
import type { PhotoAlbum, ScreenState } from '../types';

// ─── PhotosScreen ─────────────────────────────────────────────────────────────

interface Props {
  onSelectAlbum?: (album: PhotoAlbum) => void;
}

export function PhotosScreen({ onSelectAlbum }: Props): React.ReactElement {
  const { authState } = useAuth();
  const { isOnline } = useNetworkState();
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);

  const loadAlbums = useCallback(async () => {
    if (!authState.token) { setScreenState('unauthorized'); return; }
    if (!isOnline && albums.length === 0) { setScreenState('offline'); return; }

    try {
      const resp = await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authState.token}` },
        body: JSON.stringify({
          query: `query GetAlbums {
            np_family_albums(order_by: { created_at: desc }) {
              id title cover_url photo_count created_at
            }
          }`,
        }),
      });
      if (resp.status === 401) { setScreenState('unauthorized'); return; }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json() as {
        data?: { np_family_albums: Array<{ id: string; title: string; cover_url?: string; photo_count: number; created_at: string }> };
      };

      const mapped: PhotoAlbum[] = (json.data?.np_family_albums ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        coverUrl: a.cover_url,
        photoCount: a.photo_count,
        createdAt: a.created_at,
      }));

      setAlbums(mapped);
      setScreenState(mapped.length === 0 ? 'empty' : 'data');
    } catch {
      if (albums.length === 0) setScreenState('error');
    }
  }, [authState, isOnline, albums.length]);

  useEffect(() => { void loadAlbums(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlbums();
    setRefreshing(false);
  };

  const createAlbum = async (title: string) => {
    await fetch(`${authState.serverUrl}/v1/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authState.token}` },
      body: JSON.stringify({
        query: `mutation CreateAlbum($title: String!) {
          insert_np_family_albums_one(object: { title: $title }) { id }
        }`,
        variables: { title },
      }),
    });
    await loadAlbums();
  };

  const handleUploadToAlbum = async (albumId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const ImagePicker = require('expo-image-picker') as {
        requestMediaLibraryPermissionsAsync: () => Promise<{ status: string }>;
        launchImageLibraryAsync: (opts: unknown) => Promise<{
          canceled: boolean;
          assets?: Array<{ uri: string; fileSize?: number }>;
        }>;
        MediaTypeOptions: { Images: string };
      };

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo access to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) return;

      const MAX_BYTES = 20 * 1024 * 1024;
      const toUpload = result.assets.slice(0, 10).filter(
        (a) => !a.fileSize || a.fileSize <= MAX_BYTES,
      );

      for (const asset of toUpload) {
        if (!isOnline) {
          await enqueue({ kind: 'uploadPhoto', payload: { albumId, uri: asset.uri } });
        } else {
          const signResp = await fetch(`${authState.serverUrl}/api/plugins/photos/sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authState.token}` },
            body: JSON.stringify({ albumId, contentType: 'image/jpeg' }),
          });
          if (!signResp.ok) throw new Error('Failed to get upload URL');
          const { uploadUrl, photoId } = await signResp.json() as { uploadUrl: string; photoId: string };

          await fetch(uploadUrl, {
            method: 'PUT',
            body: await (await fetch(asset.uri)).blob(),
            headers: { 'Content-Type': 'image/jpeg' },
          });

          await fetch(`${authState.serverUrl}/api/plugins/photos/confirm/${photoId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${authState.token}` },
          });
        }
      }

      if (!isOnline) {
        Alert.alert('Queued', `${toUpload.length} photos will upload when you reconnect.`);
      } else {
        Alert.alert('Done', `${toUpload.length} photos uploaded.`);
        await loadAlbums();
      }
    } catch {
      Alert.alert('Upload failed', 'Could not upload photos. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Photos</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => setShowCreateAlbum(true)}
          accessibilityLabel="Create album"
          accessibilityRole="button"
        >
          <Text style={styles.addBtnText}>+ Album</Text>
        </Pressable>
      </View>

      <ScreenStateView
        state={screenState}
        onRetry={loadAlbums}
        emptyMessage="No albums yet. Create your first family album!"
        errorMessage="Could not load photo albums."
      >
        <ScrollView
          style={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BrandColors.primary} />
          }
        >
          <View style={styles.albumGrid}>
            {albums.map((album) => (
              <View key={album.id} style={styles.albumGridItem}>
                <AlbumCard
                  album={album}
                  onPress={() => {
                    onSelectAlbum ? onSelectAlbum(album) : handleUploadToAlbum(album.id);
                  }}
                />
              </View>
            ))}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </ScreenStateView>

      <CreateAlbumModal
        visible={showCreateAlbum}
        onSubmit={createAlbum}
        onClose={() => setShowCreateAlbum(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: { color: BrandColors.textPrimary, fontSize: 18, fontWeight: '700' },
  addBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  scroll: { flex: 1 },
  albumGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingTop: 12 },
  albumGridItem: { width: '50%', padding: 6 },
});
