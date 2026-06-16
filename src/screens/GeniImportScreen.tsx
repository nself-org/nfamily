/**
 * Purpose: Geni.com importer screen — OAuth connect + tree import + photo migration.
 * Inputs:  auth state; Geni OAuth code from deep-link
 * Outputs: np_family_members rows inserted; photos migrated to MinIO via nself-photos plugin
 * Constraints: Photos are fetched via Geni API and stored in MinIO via signed URL upload
 *   (no Geni URL stored directly in DB — CR-C requirement). Progress bar + cancel.
 *   Validates OAuth code via validateGeniConnect before starting import.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { validateGeniConnect } from '../lib/validation';
import { toFamilyError } from '../lib/errors';
import { useAuth } from '../hooks/useAuth';
import type { GeniImportJob } from '../types';

interface Props {
  oauthCode?: string; // pre-filled from deep-link; undefined = show connect button
  onDone?: () => void;
}

export function GeniImportScreen({ oauthCode: initialCode, onDone }: Props): React.ReactElement {
  const { authState } = useAuth();
  const [job, setJob] = useState<GeniImportJob | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  const startImport = useCallback(async (code: string) => {
    const validation = validateGeniConnect({ oauthCode: code });
    if (!validation.success) {
      setError(validation.errors?.[0]?.message ?? 'Invalid OAuth code.');
      return;
    }

    setIsConnecting(true);
    setError(null);
    setCancelled(false);

    try {
      // Step 1: Exchange code for token via nSelf family-geni plugin
      const exchangeResp = await fetch(
        `${authState.serverUrl}/api/plugins/family-geni/connect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify({ code: validation.data!.oauthCode }),
        }
      );
      if (!exchangeResp.ok) throw new Error(`Connect failed: ${exchangeResp.status}`);

      const { jobId } = (await exchangeResp.json()) as { jobId: string };

      // Step 2: Poll job status
      const pollJob: GeniImportJob = {
        id: jobId,
        status: 'running',
        membersImported: 0,
        photosImported: 0,
      };
      setJob(pollJob);

      while (!cancelled) {
        await new Promise((r) => setTimeout(r, 2000));

        const statusResp = await fetch(
          `${authState.serverUrl}/api/plugins/family-geni/jobs/${jobId}`,
          { headers: { Authorization: `Bearer ${authState.token}` } }
        );
        if (!statusResp.ok) break;

        const updated = (await statusResp.json()) as GeniImportJob;
        setJob({ ...updated });

        if (updated.status === 'done' || updated.status === 'error') break;
      }
    } catch (e) {
      const fe = toFamilyError(e, 'geni_api');
      setError(fe.message);
    } finally {
      setIsConnecting(false);
    }
  }, [authState, cancelled]);

  const handleConnect = () => {
    // In production, open Geni.com OAuth in a WebView or browser
    // For scaffold: use initialCode if present, else prompt user
    const code = initialCode ?? 'DEMO_OAUTH_CODE';
    void startImport(code);
  };

  const handleCancel = () => {
    setCancelled(true);
    setIsConnecting(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
    >
      <Text style={styles.title}>Import from Geni.com</Text>
      <Text style={styles.subtitle}>
        Connect your Geni account to import your family tree and photos.
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Before import */}
      {!job && !isConnecting && (
        <>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              • Family tree members will be imported and linked.{'\n'}
              • Photos are copied to your personal storage (not linked from Geni).{'\n'}
              • Provide your Geni API key in Settings → Integrations before connecting.
            </Text>
          </View>
          <Pressable
            style={styles.button}
            onPress={handleConnect}
            accessibilityLabel="Connect Geni account"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Connect Geni Account</Text>
          </Pressable>
        </>
      )}

      {/* During import */}
      {isConnecting && !job && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={styles.statusText}>Connecting to Geni.com…</Text>
        </View>
      )}

      {/* Job progress */}
      {job && (
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {job.status === 'done'
              ? 'Import Complete'
              : job.status === 'error'
              ? 'Import Error'
              : 'Importing…'}
          </Text>
          <Text style={styles.progressStat}>
            Members imported: {job.membersImported}
          </Text>
          <Text style={styles.progressStat}>
            Photos migrated: {job.photosImported}
          </Text>

          {job.status === 'running' && (
            <>
              <ActivityIndicator color={BrandColors.primary} style={styles.spinner} />
              <Pressable style={styles.cancelBtn} onPress={handleCancel} accessibilityRole="button" accessibilityLabel="Cancel import">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </>
          )}

          {job.status === 'error' && job.error && (
            <Text style={styles.error}>{job.error}</Text>
          )}

          {job.status === 'done' && onDone && (
            <Pressable style={styles.button} onPress={onDone} accessibilityRole="button" accessibilityLabel="View family tree">
              <Text style={styles.buttonText}>View Family Tree</Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  title: {
    color: BrandColors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: { color: BrandColors.textSecondary, fontSize: 14, marginBottom: 20 },
  infoBox: {
    backgroundColor: BrandColors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: { color: BrandColors.textSecondary, fontSize: 13, lineHeight: 20 },
  error: {
    backgroundColor: '#450a0a',
    borderRadius: 8,
    padding: 12,
    color: BrandColors.error,
    marginBottom: 16,
    fontSize: 13,
  },
  button: {
    backgroundColor: BrandColors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  center: { alignItems: 'center', paddingVertical: 32 },
  statusText: { color: BrandColors.textSecondary, marginTop: 12 },
  progressCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  progressTitle: {
    color: BrandColors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressStat: {
    color: BrandColors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  spinner: { marginVertical: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: BrandColors.error, fontSize: 14 },
});
