/**
 * Purpose: Root layout — wraps all screens with I18nProvider, auth gate, and tab navigation.
 * Inputs:  none (reads auth from useAuth hook; detects locale via expo-localization)
 * Outputs: Expo Router Stack with conditional redirect to /auth if unauthenticated
 * Constraints:
 *   - Expo Router v3 file-based routing. AuthScreen shown when !isAuthenticated.
 *   - expo-localization is the locale detection mechanism (T-P3-E6-W1-S2-T02).
 *   - RTL: initializeI18n() called at module level so I18nManager.forceRTL fires
 *     before the first render, as required by React Native's layout engine.
 *   - NselfI18nProvider wraps the Stack for i18n context in all screens.
 * SPORT: MASTER-ROUTES.md; F12-REPO-TYPE-MAP.md (nfamily i18n complete)
 */

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BrandColors } from '../constants/theme';
import { NselfI18nProvider } from '@nself/i18n';
import type { Locale } from '@nself/i18n';
import { initializeI18n, getDeviceLocale } from '../i18n';

// ─── i18n init (module level — before first render) ──────────────────────────
// Detects device locale via expo-localization and initializes react-i18next.
// RTL layout flipping for Arabic is handled here.
initializeI18n();

function RootLayoutInner(): React.ReactElement | null {
  const { authState, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!authState.isAuthenticated && !inAuthGroup) {
      router.replace('/auth');
    } else if (authState.isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [authState.isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout(): React.ReactElement {
  const locale = getDeviceLocale() as Locale;
  return (
    <NselfI18nProvider locale={locale}>
      <RootLayoutInner />
    </NselfI18nProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: BrandColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
