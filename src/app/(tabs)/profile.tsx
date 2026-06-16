/**
 * Purpose: Profile tab — user settings, moderation queue, medical consent, sign-out.
 * Inputs:  auth state from useAuth
 * Outputs: ProfileEditor + ModerationQueueScreen + MedicalConsentScreen + sign-out
 * Constraints: Plugins covered: moderation, cms. Medical consent is COPPA-required.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ProfileEditor } from '../../components/ProfileEditor';
import { ModerationQueueScreen } from '../../screens/ModerationQueueScreen';
import { MedicalConsentScreen } from '../../screens/MedicalConsentScreen';
import { BrandColors } from '../../constants/theme';
import type { UserProfile } from '../../types';

type ProfileSubView = 'main' | 'moderation' | 'health';

export default function ProfileScreen(): React.ReactElement {
  const { authState, signOut } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [subView, setSubView] = useState<ProfileSubView>('main');

  const profile: UserProfile = {
    id: authState.email,
    email: authState.email,
    displayName: authState.email.split('@')[0] ?? 'User',
    serverUrl: authState.serverUrl,
  };

  const handleSave = async (displayName: string) => {
    setIsSaving(true);
    try {
      // Persist via Hasura mutation
      await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `mutation UpdateDisplayName($email: String!, $name: String!) {
            update_np_family_members(
              where: { email: { _eq: $email } }
              _set: { display_name: $name }
            ) { affected_rows }
          }`,
          variables: { email: authState.email, name: displayName },
        }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  // Sub-view rendering
  if (subView === 'moderation') {
    return (
      <View style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => setSubView('main')}>
          <Text style={styles.backText}>← Profile</Text>
        </Pressable>
        <ModerationQueueScreen />
      </View>
    );
  }

  if (subView === 'health') {
    return (
      <View style={styles.container}>
        <Pressable style={styles.backRow} onPress={() => setSubView('main')}>
          <Text style={styles.backText}>← Profile</Text>
        </Pressable>
        <MedicalConsentScreen />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
    >
      <ProfileEditor profile={profile} isSaving={isSaving} onSave={handleSave} />

      {/* Settings links */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <Pressable
          style={styles.settingRow}
          onPress={() => setSubView('health')}
          accessibilityLabel="Health and privacy settings"
          accessibilityRole="button"
        >
          <Text style={styles.settingRowText}>🏥 Health & Privacy</Text>
          <Text style={styles.settingRowChevron}>›</Text>
        </Pressable>

        <Pressable
          style={styles.settingRow}
          onPress={() => setSubView('moderation')}
          accessibilityLabel="Moderation queue"
          accessibilityRole="button"
        >
          <Text style={styles.settingRowText}>🛡️ Moderation Queue</Text>
          <Text style={styles.settingRowChevron}>›</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityLabel="Sign out"
        accessibilityRole="button"
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.version}>nFamily v0.1.2 · nSelf ɳFamily bundle</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  backRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  backText: { color: BrandColors.primary, fontSize: 15 },
  settingsSection: { marginTop: 28 },
  sectionTitle: {
    color: BrandColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingRowText: { color: BrandColors.textPrimary, fontSize: 15 },
  settingRowChevron: { color: BrandColors.textSecondary, fontSize: 20 },
  signOutButton: {
    marginTop: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.error,
    paddingVertical: 13,
    alignItems: 'center',
  },
  signOutText: { color: BrandColors.error, fontWeight: '600', fontSize: 15 },
  version: {
    color: BrandColors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
  },
});
