/**
 * Purpose: Medical consent settings screen — toggle for health data sharing within family.
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
  Pressable,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { toFamilyError } from '../lib/errors';
import { useAuth } from '../hooks/useAuth';

interface ConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

function ConsentModal({ visible, onAccept, onDecline }: ConsentModalProps): React.ReactElement {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onDecline}
    >
      <ScrollView
        style={styles.modalContainer}
        contentContainerStyle={styles.modalScroll}
      >
        <Text style={styles.modalTitle}>Health Data Sharing</Text>
        <Text style={styles.modalSubtitle}>Before you enable this, please read:</Text>

        <View style={styles.disclosureSection}>
          <Text style={styles.disclosureHeading}>What data is shared?</Text>
          <Text style={styles.disclosureText}>
            Health milestones and notes you explicitly add to your family profile —
            for example, medical conditions you choose to share, medication reminders,
            and wellness check-ins.
          </Text>
        </View>

        <View style={styles.disclosureSection}>
          <Text style={styles.disclosureHeading}>Who can see it?</Text>
          <Text style={styles.disclosureText}>
            Only family members you have explicitly added to your family group.
            Third parties, advertisers, and nSelf staff cannot access this data.
          </Text>
        </View>

        <View style={styles.disclosureSection}>
          <Text style={styles.disclosureHeading}>How do I revoke?</Text>
          <Text style={styles.disclosureText}>
            You can disable health data sharing at any time in Settings → Health & Privacy.
            Disabling removes shared data from other family members' views immediately.
          </Text>
        </View>

        <View style={styles.disclosureSection}>
          <Text style={styles.disclosureHeading}>Data storage</Text>
          <Text style={styles.disclosureText}>
            All data is stored on your self-hosted nSelf instance. nSelf Inc. never
            has access to your health information.
          </Text>
        </View>

        <View style={styles.modalActions}>
          <Pressable
            style={styles.declineBtn}
            onPress={onDecline}
            accessibilityLabel="Decline health data sharing"
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </Pressable>
          <Pressable
            style={styles.acceptBtn}
            onPress={onAccept}
            accessibilityLabel="Enable health data sharing"
          >
            <Text style={styles.acceptBtnText}>I Understand — Enable</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

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
  // Modal
  modalContainer: { flex: 1, backgroundColor: BrandColors.background },
  modalScroll: { padding: 24, paddingBottom: 40 },
  modalTitle: { color: BrandColors.textPrimary, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  modalSubtitle: { color: BrandColors.textSecondary, fontSize: 14, marginBottom: 20 },
  disclosureSection: { marginBottom: 20 },
  disclosureHeading: { color: BrandColors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  disclosureText: { color: BrandColors.textSecondary, fontSize: 14, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  declineBtn: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  declineBtnText: { color: BrandColors.textSecondary, fontWeight: '600', fontSize: 15 },
  acceptBtn: {
    flex: 2,
    backgroundColor: BrandColors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
