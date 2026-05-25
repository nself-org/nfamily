/**
 * Purpose: Root layout — wraps all screens with auth gate and tab navigation.
 * Inputs:  none (reads auth from useAuth hook)
 * Outputs: Expo Router Stack with conditional redirect to /auth if unauthenticated
 * Constraints: Expo Router v3 file-based routing. AuthScreen shown when !isAuthenticated.
 * SPORT: MASTER-ROUTES.md
 */

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { BrandColors } from '../constants/theme';

export default function RootLayout(): React.ReactElement | null {
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: BrandColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
