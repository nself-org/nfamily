/**
 * Purpose: Profile tab — shows current user info and sign-out button.
 * Inputs:  auth state from useAuth, ProfileEditor component
 * Outputs: ProfileEditor form + sign-out Pressable
 * Constraints: display name edit is local-only until P-FAM-5 Hasura mutation ships.
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
import { BrandColors } from '../../constants/theme';
import type { UserProfile } from '../../types';

export default function ProfileScreen(): React.ReactElement {
  const { authState, signOut } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const profile: UserProfile = {
    id: authState.email,
    email: authState.email,
    displayName: authState.email.split('@')[0] ?? 'User',
    serverUrl: authState.serverUrl,
  };

  const handleSave = async (displayName: string) => {
    setIsSaving(true);
    try {
      // TODO(P-FAM-5): persist via Hasura mutation
      await new Promise((r) => setTimeout(r, 400));
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
    >
      <ProfileEditor profile={profile} isSaving={isSaving} onSave={handleSave} />

      <Pressable
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityLabel="Sign out"
        accessibilityRole="button"
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.version}>nFamily v0.1.1 — pre-alpha</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { padding: 20, paddingBottom: 48 },
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
