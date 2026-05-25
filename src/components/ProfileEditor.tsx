/**
 * Purpose: Editable profile form for display name. Calls onSave with new value.
 * Inputs:  profile (UserProfile), onSave (callback), isSaving (boolean)
 * Outputs: Form with TextInput and Save button
 * Constraints: controlled component; parent owns save logic. Single responsibility.
 * SPORT: MASTER-COMPONENTS.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import type { UserProfile } from '../types';

interface ProfileEditorProps {
  profile: UserProfile;
  isSaving: boolean;
  onSave: (displayName: string) => void;
}

export function ProfileEditor({
  profile,
  isSaving,
  onSave,
}: ProfileEditorProps): React.ReactElement {
  const [displayName, setDisplayName] = useState(profile.displayName);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Your name"
        placeholderTextColor={BrandColors.textSecondary}
        accessibilityLabel="Display name"
      />
      <Text style={styles.label}>Email</Text>
      <Text style={styles.staticValue}>{profile.email}</Text>

      <Text style={styles.label}>Server</Text>
      <Text style={styles.staticValue}>{profile.serverUrl}</Text>

      <Pressable
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={() => onSave(displayName)}
        disabled={isSaving}
        accessibilityLabel="Save profile"
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: BrandColors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  input: {
    backgroundColor: BrandColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    color: BrandColors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  staticValue: {
    color: BrandColors.textPrimary,
    fontSize: 15,
    paddingVertical: 4,
  },
  button: {
    marginTop: 24,
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
