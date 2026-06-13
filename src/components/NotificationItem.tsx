/**
 * Purpose: Renders a single in-app notification row with read/unread indicator.
 * Inputs:  notification (FamilyNotification), onPress (callback)
 * Outputs: Pressable row with title, body, timestamp, and unread dot
 * Constraints: onPress triggers markRead in parent hook. Single responsibility.
 * SPORT: MASTER-COMPONENTS.md
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BrandColors } from '../constants/theme';
import type { FamilyNotification } from '../types';

interface NotificationItemProps {
  notification: FamilyNotification;
  onPress: (id: string) => void;
}

export function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps): React.ReactElement {
  const relativeTime = new Date(notification.createdAt).toLocaleDateString();

  return (
    <Pressable
      style={[styles.item, notification.read && styles.itemRead]}
      onPress={() => onPress(notification.id)}
      accessibilityLabel={`Notification: ${notification.title}. ${notification.read ? 'Read' : 'Unread'}`}
    >
      {!notification.read && <View style={styles.unreadDot} />}
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={styles.time}>{relativeTime}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  itemRead: {
    opacity: 0.6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.primary,
    marginTop: 5,
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    color: BrandColors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  body: {
    color: BrandColors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  time: {
    color: BrandColors.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },
});
