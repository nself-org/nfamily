/**
 * Purpose: 7-state screen wrapper — renders one of 7 distinct UI states for data screens.
 * Inputs:  state (ScreenState), children (for 'data' state), optional callbacks
 * Outputs: Appropriate UI for loading/refreshing/empty/data/error/offline/unauthorized
 * Constraints: All data screens MUST use this component. Never inline state checks.
 * SPORT: MASTER-COMPONENTS.md
 */

import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import type { ScreenState } from '../types';

interface Props {
  state: ScreenState;
  children?: React.ReactNode;
  onRetry?: () => void;
  onSignIn?: () => void;
  emptyMessage?: string;
  errorMessage?: string;
}

/**
 * Render one of the 7 canonical screen states.
 *
 * State     | Shown when
 * --------- | ------------------------------------------
 * loading   | Initial data load, no cached data
 * refreshing| Pull-to-refresh in progress (data shown under indicator)
 * empty     | Loaded, zero items
 * data      | Loaded, items present
 * error     | Load failed, no data
 * offline   | Device is offline, no cached data
 * unauthorized | JWT expired or no access
 */
export function ScreenStateView({
  state,
  children,
  onRetry,
  onSignIn,
  emptyMessage = 'Nothing here yet.',
  errorMessage = 'Something went wrong.',
}: Props): React.ReactElement {
  if (state === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
        <Text style={styles.label}>Loading…</Text>
      </View>
    );
  }

  if (state === 'offline') {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.title}>You're offline</Text>
        <Text style={styles.label}>Changes will sync when you reconnect.</Text>
        {onRetry && (
          <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button" accessibilityLabel="Retry">
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (state === 'unauthorized') {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Session expired</Text>
        <Text style={styles.label}>Please sign in again to continue.</Text>
        {onSignIn && (
          <Pressable style={styles.button} onPress={onSignIn} accessibilityRole="button" accessibilityLabel="Sign in">
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.label}>{errorMessage}</Text>
        {onRetry && (
          <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button" accessibilityLabel="Try again">
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (state === 'empty') {
    return (
      <View style={styles.center}>
        <Text style={styles.icon}>📭</Text>
        <Text style={styles.label}>{emptyMessage}</Text>
      </View>
    );
  }

  // 'data' or 'refreshing' — render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: { fontSize: 48, marginBottom: 12 },
  title: {
    color: BrandColors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  label: {
    color: BrandColors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
