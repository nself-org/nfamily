/**
 * Purpose: Activity feed screen — aggregated family timeline with Hasura subscription.
 * Inputs:  auth state; Hasura subscription (np_family_activity_feed)
 * Outputs: Live-updating timeline of family activity items
 * Constraints: 7-state screen. Subscription via WebSocket through Apollo Client.
 *   Falls back to polling every 30s if subscription fails.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { ScreenStateView } from '../components/ScreenStateView';
import { useAuth } from '../hooks/useAuth';
import { useNetworkState } from '../hooks/useNetworkState';
import type { ActivityItem, ActivityType, ScreenState } from '../types';

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  post_created: '📝',
  photo_uploaded: '📷',
  member_joined: '👋',
  birthday: '🎂',
  milestone: '🏆',
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  post_created: 'posted',
  photo_uploaded: 'added photos',
  member_joined: 'joined the family',
  birthday: 'has a birthday today',
  milestone: 'reached a milestone',
};

interface ActivityItemCardProps {
  item: ActivityItem;
}

function ActivityItemCard({ item }: ActivityItemCardProps): React.ReactElement {
  const icon = ACTIVITY_ICONS[item.type] ?? '📌';
  const label = ACTIVITY_LABELS[item.type] ?? item.type;

  return (
    <View style={styles.activityCard}>
      <View style={styles.activityIconCol}>
        <Text style={styles.activityIcon}>{icon}</Text>
        <View style={styles.activityLine} />
      </View>
      <View style={styles.activityBody}>
        <Text style={styles.activityText}>
          <Text style={styles.activityActor}>{item.actorName} </Text>
          <Text>{label}</Text>
        </Text>
        <Text style={styles.activityTime}>
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

export function ActivityFeedScreen(): React.ReactElement {
  const { authState } = useAuth();
  const { isOnline } = useNetworkState();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const loadActivity = useCallback(async () => {
    if (!authState.token) { setScreenState('unauthorized'); return; }
    if (!isOnline && items.length === 0) { setScreenState('offline'); return; }

    try {
      const resp = await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `query GetActivityFeed {
            np_family_activity_feed(
              limit: 50
              order_by: { created_at: desc }
            ) {
              id type actor_id actor { display_name } payload created_at
            }
          }`,
        }),
      });

      if (resp.status === 401) { setScreenState('unauthorized'); return; }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json() as {
        data?: {
          np_family_activity_feed: Array<{
            id: string; type: string; actor_id: string;
            actor: { display_name: string }; payload: Record<string, unknown>; created_at: string;
          }>;
        };
      };

      const mapped: ActivityItem[] = (json.data?.np_family_activity_feed ?? []).map((a) => ({
        id: a.id,
        type: a.type as ActivityType,
        actorId: a.actor_id,
        actorName: a.actor.display_name,
        payload: a.payload,
        createdAt: a.created_at,
      }));

      setItems(mapped);
      setScreenState(mapped.length === 0 ? 'empty' : 'data');
    } catch {
      if (items.length === 0) setScreenState('error');
    }
  }, [authState, isOnline, items.length]);

  useEffect(() => {
    void loadActivity();

    // Poll every 30s as subscription fallback
    const interval = setInterval(() => {
      void loadActivity();
    }, 30_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivity();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Activity</Text>
        {!isOnline && <Text style={styles.offlineIndicator}>📡 Offline</Text>}
      </View>

      <ScreenStateView
        state={screenState}
        onRetry={loadActivity}
        emptyMessage="No family activity yet."
        errorMessage="Could not load activity feed."
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
          {items.map((item) => (
            <ActivityItemCard key={item.id} item={item} />
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </ScreenStateView>
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
  offlineIndicator: { color: '#fde68a', fontSize: 13 },
  scroll: { flex: 1 },
  activityCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  activityIconCol: { alignItems: 'center', marginRight: 14, width: 32 },
  activityIcon: { fontSize: 22 },
  activityLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#1F2937',
    marginTop: 6,
    minHeight: 20,
  },
  activityBody: {
    flex: 1,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  activityText: { color: BrandColors.textPrimary, fontSize: 14, lineHeight: 20 },
  activityActor: { fontWeight: '600', color: BrandColors.textPrimary },
  activityTime: { color: BrandColors.textSecondary, fontSize: 11, marginTop: 4 },
});
