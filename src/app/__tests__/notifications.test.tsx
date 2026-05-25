/**
 * Purpose: Smoke tests for Notifications screen.
 * Inputs:  Rendered NotificationsScreen with mocked hooks
 * Outputs: Jest test results
 * Constraints: Mocks useNotifications and expo-notifications.
 * SPORT: MASTER-ROUTES.md
 */

import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'expo-token' }),
  setNotificationHandler: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: { eas: { projectId: 'test-project' } } } },
}));

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    authState: { isAuthenticated: true, serverUrl: 'https://test.com', email: 'u@t.com', token: 'tok' },
    isLoading: false,
  }),
}));

jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    markRead: jest.fn(),
  }),
}));

import NotificationsScreen from '../(tabs)/notifications';

describe('NotificationsScreen', () => {
  it('renders empty state', () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText('No notifications yet.')).toBeTruthy();
  });
});
