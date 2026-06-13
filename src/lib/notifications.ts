/**
 * Purpose: Expo push notification registration and permission helpers.
 * Inputs:  none (uses Expo Notifications API)
 * Outputs: push token string or null if permission denied
 * Constraints: physical device required for push tokens (simulator returns null).
 *   Calls nSelf backend to register token after retrieval. Deferred to P-FAM-5+.
 * SPORT: MASTER-LIBS.md
 */

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and return the Expo push token.
 * Returns null if permissions denied or running in a simulator.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}
