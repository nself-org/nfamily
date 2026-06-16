/**
 * Purpose: Root layout — wraps all screens with I18nProvider, Sentry/OTel init, auth gate, and tab navigation.
 * Inputs:  EXPO_PUBLIC_SENTRY_DSN, EXPO_PUBLIC_OTEL_ENDPOINT, APP_ENV, EXPO_PUBLIC_APP_VERSION from build env;
 *          locale from expo-localization; auth state from useAuth hook.
 * Outputs: Expo Router Stack with conditional redirect to /auth if unauthenticated;
 *          Sentry + OTel registered for native crash and error reporting.
 * Constraints:
 *   - initObservability() MUST be called at module level (before any screen renders) so Sentry
 *     captures errors that occur during initial navigation and auth resolution.
 *   - Expo Router v3 file-based routing. AuthScreen shown when !isAuthenticated.
 *   - expo-localization is the locale detection mechanism (T-P3-E6-W1-S2-T02).
 *   - RTL: initializeI18n() called at module level so I18nManager.forceRTL fires
 *     before the first render, as required by React Native's layout engine.
 *   - NselfI18nProvider wraps the Stack for i18n context in all screens.
 *   - PII scrubbing runs unconditionally via scrubEvent as beforeSend inside initObservability
 *     (strips user.email, user.id, and common PII patterns).
 *   - Sentry.wrap() is applied to the default export for native crash capture.
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
import * as SentryRN from '@sentry/react-native';
import type { SentrySdk } from '@nself/observability';
import { initObservability } from '@nself/observability';

// ─── i18n init (module level — before first render) ──────────────────────────
// Detects device locale via expo-localization and initializes react-i18next.
// RTL layout flipping for Arabic is handled here.
initializeI18n();

// ─── Sentry + OTel init (module level — before first render) ─────────────────
// initObservability calls Sentry.init() with scrubEvent as beforeSend (PII scrubbing)
// and registers OTel tracing. Gracefully no-ops if DSN is absent.
initObservability({
  sentry: {
    sdk: SentryRN as unknown as SentrySdk,
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
    environment: process.env.APP_ENV ?? 'development',
    appKind: 'native' as const,
    tracesSampleRate: process.env.APP_ENV === 'production' ? 0.2 : 1.0,
    release: process.env.EXPO_PUBLIC_APP_VERSION ?? '1.1.1',
  },
  otel: process.env.EXPO_PUBLIC_OTEL_ENDPOINT
    ? {
        serviceName: 'nfamily',
        endpoint: process.env.EXPO_PUBLIC_OTEL_ENDPOINT,
      }
    : undefined,
});

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

function RootLayout(): React.ReactElement {
  const locale = getDeviceLocale() as Locale;
  return (
    <NselfI18nProvider locale={locale}>
      <RootLayoutInner />
    </NselfI18nProvider>
  );
}

// Sentry.wrap captures native crash reports (JS thread + native thread crashes).
export default SentryRN.wrap(RootLayout);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: BrandColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
