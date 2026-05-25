/**
 * Purpose: Notification list hook — fetches in-app notifications from nSelf backend.
 * Inputs:  serverUrl (string), authToken (string)
 * Outputs: { notifications, unreadCount, markRead, isLoading, error }
 * Constraints: push registration handled separately in lib/notifications.ts.
 *   In-app list fetched from np_family_notifications via Hasura. Deferred P-FAM-5+.
 * SPORT: MASTER-HOOKS.md
 */

import { useState, useEffect, useCallback } from 'react';
import type { FamilyNotification } from '../types';

interface UseNotificationsReturn {
  notifications: FamilyNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markRead: (id: string) => void;
}

export function useNotifications(
  serverUrl: string,
  authToken: string | null
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authToken || !serverUrl) return;
    setIsLoading(true);
    // TODO(P-FAM-5): Apollo subscription to np_family_notifications
    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 200));
        setNotifications([]);
      } catch {
        setError('Failed to load notifications.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [serverUrl, authToken]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // TODO(P-FAM-5): mutation to mark read in Hasura
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, isLoading, error, markRead };
}
