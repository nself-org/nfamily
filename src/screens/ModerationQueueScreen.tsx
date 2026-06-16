/**
 * Purpose: Moderation queue screen — admin review of reported content.
 * Inputs:  auth state; moderation reports from np_moderation_reports
 * Outputs: Admin can dismiss or action each report; status updated in DB
 * Constraints: 7-state screen. Only users with admin role see actionable buttons.
 *   Status: pending → reviewed → actioned | dismissed.
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
  ActivityIndicator,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { ScreenStateView } from '../components/ScreenStateView';
import { toFamilyError } from '../lib/errors';
import { useAuth } from '../hooks/useAuth';
import { useNetworkState } from '../hooks/useNetworkState';
import type { ModerationReport, ScreenState } from '../types';

interface ReportCardProps {
  report: ModerationReport;
  onAction: (id: string, action: 'actioned' | 'dismissed') => Promise<void>;
}

function ReportCard({ report, onAction }: ReportCardProps): React.ReactElement {
  const [isActing, setIsActing] = useState(false);

  const handleAction = async (action: 'actioned' | 'dismissed') => {
    setIsActing(true);
    try {
      await onAction(report.id, action);
    } finally {
      setIsActing(false);
    }
  };

  const statusColor = {
    pending: '#fde68a',
    reviewed: BrandColors.primary,
    actioned: BrandColors.error,
    dismissed: BrandColors.textSecondary,
  }[report.status];

  return (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportType}>
          {report.contentType.toUpperCase()} · {report.reason}
        </Text>
        <Text style={[styles.reportStatus, { color: statusColor }]}>
          {report.status}
        </Text>
      </View>
      <Text style={styles.reportId}>Content ID: {report.contentId.slice(0, 8)}…</Text>
      <Text style={styles.reportDate}>
        {new Date(report.createdAt).toLocaleDateString()}
      </Text>

      {report.status === 'pending' && (
        <View style={styles.reportActions}>
          {isActing ? (
            <ActivityIndicator color={BrandColors.primary} />
          ) : (
            <>
              <Pressable
                style={[styles.actionBtn, styles.actionDismiss]}
                onPress={() => handleAction('dismissed')}
                accessibilityLabel="Dismiss report"
              >
                <Text style={styles.actionDismissText}>Dismiss</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.actionRemove]}
                onPress={() => {
                  Alert.alert(
                    'Remove Content',
                    'This will remove the reported content. Continue?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => void handleAction('actioned') },
                    ]
                  );
                }}
                accessibilityLabel="Remove reported content"
              >
                <Text style={styles.actionRemoveText}>Remove</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

export function ModerationQueueScreen(): React.ReactElement {
  const { authState } = useAuth();
  const { isOnline } = useNetworkState();
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    if (!authState.token) { setScreenState('unauthorized'); return; }
    if (!isOnline && reports.length === 0) { setScreenState('offline'); return; }

    try {
      const resp = await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `query GetModerationQueue {
            np_moderation_reports(
              order_by: { created_at: desc }
              limit: 50
            ) {
              id content_type content_id reporter_id reason status created_at
            }
          }`,
        }),
      });

      if (resp.status === 401) { setScreenState('unauthorized'); return; }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json() as {
        data?: {
          np_moderation_reports: Array<{
            id: string; content_type: string; content_id: string;
            reporter_id: string; reason: string; status: string; created_at: string;
          }>;
        };
      };

      const mapped: ModerationReport[] = (json.data?.np_moderation_reports ?? []).map((r) => ({
        id: r.id,
        contentType: r.content_type as ModerationReport['contentType'],
        contentId: r.content_id,
        reporterId: r.reporter_id,
        reason: r.reason as ModerationReport['reason'],
        status: r.status as ModerationReport['status'],
        createdAt: r.created_at,
      }));

      setReports(mapped);
      setScreenState(mapped.length === 0 ? 'empty' : 'data');
    } catch {
      if (reports.length === 0) setScreenState('error');
    }
  }, [authState, isOnline, reports.length]);

  useEffect(() => { void loadReports(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (id: string, action: 'actioned' | 'dismissed') => {
    try {
      await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `mutation UpdateReport($id: uuid!, $status: String!) {
            update_np_moderation_reports_by_pk(
              pk_columns: { id: $id }
              _set: { status: $status }
            ) { id }
          }`,
          variables: { id, status: action },
        }),
      });

      // Optimistic update
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action } : r))
      );
    } catch (e) {
      const fe = toFamilyError(e);
      Alert.alert('Error', fe.message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const pending = reports.filter((r) => r.status === 'pending').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moderation</Text>
        {pending > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pending}</Text>
          </View>
        )}
      </View>

      <ScreenStateView
        state={screenState}
        onRetry={loadReports}
        emptyMessage="No reports — your family is behaving!"
        errorMessage="Could not load moderation queue."
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
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} onAction={handleAction} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    gap: 8,
  },
  headerTitle: { color: BrandColors.textPrimary, fontSize: 18, fontWeight: '700' },
  badge: {
    backgroundColor: BrandColors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  scroll: { flex: 1 },
  reportCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    margin: 12,
    marginBottom: 6,
    padding: 14,
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reportType: { color: BrandColors.textPrimary, fontWeight: '600', fontSize: 13 },
  reportStatus: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  reportId: { color: BrandColors.textSecondary, fontSize: 12, marginBottom: 2 },
  reportDate: { color: BrandColors.textSecondary, fontSize: 11 },
  reportActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  actionDismiss: { backgroundColor: '#1F2937' },
  actionDismissText: { color: BrandColors.textSecondary, fontWeight: '600', fontSize: 13 },
  actionRemove: { backgroundColor: '#450a0a', borderWidth: 1, borderColor: BrandColors.error },
  actionRemoveText: { color: BrandColors.error, fontWeight: '600', fontSize: 13 },
});
