/**
 * Purpose: Health data sharing consent modal for MedicalConsentScreen.
 *          Extracted from MedicalConsentScreen.tsx to keep that file under 300 lines.
 *
 * Inputs:
 *   visible   — controls modal visibility.
 *   onAccept  — called when user taps "I Understand — Enable".
 *   onDecline — called when user taps "Decline" or dismisses.
 *
 * Outputs: Full-screen formSheet modal with disclosure of what health data is shared,
 *          who sees it, and how to revoke consent.
 *
 * Constraints:
 *   - Displays data sharing disclosure (what/who/revoke/storage) before accepting.
 *   - onAccept and onDecline are the only side-effect entry points — no state here.
 *   - Text must be clear and WCAG 2.1 AA compliant.
 *
 * SPORT: MASTER-ROUTES.md
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { BrandColors } from '../constants/theme';

export interface ConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentModal({ visible, onAccept, onDecline }: ConsentModalProps): React.ReactElement {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onDecline}
    >
      <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalScroll}>
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
          <Pressable style={styles.declineBtn} onPress={onDecline} accessibilityLabel="Decline health data sharing">
            <Text style={styles.declineBtnText}>Decline</Text>
          </Pressable>
          <Pressable style={styles.acceptBtn} onPress={onAccept} accessibilityLabel="Enable health data sharing">
            <Text style={styles.acceptBtnText}>I Understand — Enable</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
