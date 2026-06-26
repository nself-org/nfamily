/**
 * Purpose: Medical consent settings screen — toggle for health data sharing within family.
 *          ConsentModal extracted to ConsentModal.tsx to keep this file under 300 lines.
 * Inputs:  auth state; current consent state from np_family_members.medical_consent_given
 * Outputs: Updated consent flag via Hasura mutation; stored in np_family_members
 * Constraints: Clear disclosure of what data is shared, who sees it, and how to revoke.
 *   Consent modal shown before enabling. Can be revoked at any time.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { toFamilyError } from '../lib/errors';
import { useAuth } from '../hooks/useAuth';
import { ConsentModal } from './ConsentModal';

export function MedicalConsentScreen(): React.ReactElement {
  const { authState } = useAuth();
  const [consentGiven, setConsentGiven] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConsent = useCallback(async () => {
    if (!authState.token) return;
    setIsLoading(true);
    try {
      const resp = await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `query GetConsent {
            np_family_members(where: { email: { _eq: "${authState.email}" } }, limit: 1) {
              medical_consent_given
            }
          }`,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json() as {
        data?: { np_family_members: Array<{ medical_consent_given: boolean }> };
      };
      const member = json.data?.np_family_members?.[0];
      if (member) setConsentGiven(member.medical_consent_given);
    } catch {
      // Non-fatal — default to false
    } finally {
      setIsLoading(false);
    }
  }, [authState]);

  useEffect(() => { void loadConsent(); }, [loadConsent]);

  const saveConsent = async (value: boolean) => {
    setIsSaving(true);
    setError(null);
    try {
      const resp = await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `mutation UpdateConsent($email: String!, $consent: Boolean!) {
            update_np_family_members(
              where: { email: { _eq: $email } }
              _set: { medical_consent_given: $consent }
            ) { affected_rows }
          }`,
          variables: { email: authState.email, consent: value },
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setConsentGiven(value);
    } catch (e) {
      const fe = toFamilyError(e);
      setError(fe.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (value: boolean) => {
    if (value && !consentGiven) {
      setShowModal(true);
    } else if (!value && consentGiven) {
      Alert.alert(
        'Disable Health Data Sharing',
        'Your health information will no longer be shared with family members. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: () => void saveConsent(false) },
        ]
      );
    }
  };

  const handleAcceptConsent = () => {
    setShowModal(false);
    void saveConsent(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Health & Privacy</Text>
      <Text style={styles.subtitle}>
        Control whether your health information is shared with family members.
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Enable health data sharing</Text>
          <Text style={styles.settingDescription}>
            Share health milestones and wellness notes with your family group.
          </Text>
        </View>
        {isLoading || isSaving ? (
          <ActivityIndicator color={BrandColors.primary} />
        ) : (
          <Switch
            value={consentGiven}
            onValueChange={handleToggle}
            trackColor={{ false: '#374151', true: BrandColors.primary }}
            thumbColor={consentGiven ? '#fff' : '#9CA3AF'}
            accessibilityLabel="Health data sharing toggle"
          />
        )}
      </View>

      {consentGiven && (
        <View style={styles.consentActiveCard}>
          <Text style={styles.consentActiveIcon}>✅</Text>
          <Text style={styles.consentActiveText}>
            Health data sharing is enabled. Your family members can see health
            information you choose to share. You can disable this at any time.
          </Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>What is shared?</Text>
        <Text style={styles.infoText}>
          Only data you explicitly add to your health profile — such as conditions,
          medications, and wellness notes. Location and real-time health metrics
          are never automatically shared.
        </Text>
      </View>

      <ConsentModal
        visible={showModal}
        onAccept={handleAcceptConsent}
        onDecline={() => setShowModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { color: BrandColors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: BrandColors.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 20 },
  error: {
    backgroundColor: '#450a0a',
    borderRadius: 8,
    padding: 12,
    color: BrandColors.error,
    marginBottom: 16,
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { color: BrandColors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  settingDescription: { color: BrandColors.textSecondary, fontSize: 13, lineHeight: 18 },
  consentActiveCard: {
    flexDirection: 'row',
    backgroundColor: '#064e3b',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    gap: 10,
    alignItems: 'flex-start',
  },
  consentActiveIcon: { fontSize: 18 },
  consentActiveText: { flex: 1, color: '#a7f3d0', fontSize: 13, lineHeight: 18 },
  infoSection: {
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: { color: BrandColors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  infoText: { color: BrandColors.textSecondary, fontSize: 13, lineHeight: 19 },
});
