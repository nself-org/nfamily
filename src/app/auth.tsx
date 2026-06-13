/**
 * Purpose: Auth screen — server URL + email + password sign-in form.
 * Inputs:  none (uses useAuth hook internally)
 * Outputs: Sign-in form screen; redirects to / on success via root layout
 * Constraints: Migrated from lib/screens/auth_screen.dart. SDK integration P-FAM-4+.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { BrandColors } from '../constants/theme';

export default function AuthScreen(): React.ReactElement {
  const { signIn, isLoading, error } = useAuth();
  const [serverUrl, setServerUrl] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!serverUrl.trim() || !email.trim() || !password) {
      setLocalError('All fields are required.');
      return;
    }
    setLocalError(null);
    await signIn(serverUrl.trim(), email.trim(), password);
  };

  const displayError = localError ?? error;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand header */}
        <View style={styles.header} accessibilityRole="header">
          <Text style={styles.icon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.title}>nFamily</Text>
          <Text style={styles.subtitle}>Pre-alpha — connect to your nSelf backend</Text>
        </View>

        {/* Server URL */}
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="Server URL (https://your-server.example.com)"
          placeholderTextColor={BrandColors.textSecondary}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Server URL"
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={BrandColors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Email address"
        />

        {/* Password */}
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={BrandColors.textSecondary}
          secureTextEntry
          accessibilityLabel="Password"
        />

        {displayError ? (
          <Text style={styles.error} accessibilityRole="alert">
            {displayError}
          </Text>
        ) : null}

        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading}
          accessibilityLabel="Sign in"
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        {/* Pre-alpha notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            nFamily is in pre-alpha. Requires an nSelf backend with the nFamily plugin
            bundle ($0.99/mo or included in nSelf+).
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  icon: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    color: BrandColors.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: BrandColors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
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
    marginBottom: 16,
  },
  error: {
    color: BrandColors.error,
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  notice: {
    backgroundColor: BrandColors.primary + '1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.primary + '4D',
    padding: 12,
  },
  noticeText: {
    color: BrandColors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
