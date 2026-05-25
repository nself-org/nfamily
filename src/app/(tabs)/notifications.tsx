/**
 * Purpose: Notifications tab — in-app notification list with mark-read support.
 * Inputs:  auth state from useAuth, notifications from useNotifications hook
 * Outputs: Scrollable list of NotificationItem rows; unread count in header badge
 * Constraints: push token registration happens on mount via lib/notifications.ts.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from '../../components/NotificationItem';
import { registerForPushNotifications } from '../../lib/notifications';
import { BrandColors } from '../../constants/theme';

export default function NotificationsScreen(): React.ReactElement {
  const { authState } = useAuth();
  const { notifications, isLoading, error, markRead } = useNotifications(
    authState.serverUrl,
    authState.token
  );

  // Register for push notifications on mount (physical device only)
  useEffect(() => {
    registerForPushNotifications().catch(() => {
      // Non-fatal — simulator always returns null
    });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={BrandColors.primary}
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : notifications.length === 0 ? (
          <Text style={styles.empty}>No notifications yet.</Text>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onPress={markRead} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { padding: 16 },
  loader: { marginTop: 48 },
  error: { color: BrandColors.error, textAlign: 'center', marginTop: 32 },
  empty: { color: BrandColors.textSecondary, textAlign: 'center', marginTop: 48 },
});
