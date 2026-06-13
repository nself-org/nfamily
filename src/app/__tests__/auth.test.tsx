/**
 * Purpose: Smoke + unit tests for AuthScreen.
 * Inputs:  Rendered AuthScreen component
 * Outputs: Jest test results
 * Constraints: Mocks useAuth hook; does not exercise SecureStore I/O.
 * SPORT: MASTER-ROUTES.md
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useSegments: () => [],
  Stack: { Screen: () => null },
}));

// Mock useAuth
const mockSignIn = jest.fn();
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    authState: { isAuthenticated: false, serverUrl: '', email: '', token: null },
    isLoading: false,
    signIn: mockSignIn,
    signOut: jest.fn(),
    error: null,
  }),
}));

import AuthScreen from '../auth';

describe('AuthScreen', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it('renders sign-in form', () => {
    const { getByAccessibilityLabel } = render(<AuthScreen />);
    expect(getByAccessibilityLabel('Server URL')).toBeTruthy();
    expect(getByAccessibilityLabel('Email address')).toBeTruthy();
    expect(getByAccessibilityLabel('Password')).toBeTruthy();
    expect(getByAccessibilityLabel('Sign in')).toBeTruthy();
  });

  it('shows validation error when fields are empty', async () => {
    const { getByAccessibilityLabel, getByText } = render(<AuthScreen />);
    fireEvent.press(getByAccessibilityLabel('Sign in'));
    await waitFor(() => {
      expect(getByText('All fields are required.')).toBeTruthy();
    });
  });

  it('calls signIn with correct args', async () => {
    const { getByAccessibilityLabel } = render(<AuthScreen />);
    fireEvent.changeText(getByAccessibilityLabel('Server URL'), 'https://test.example.com');
    fireEvent.changeText(getByAccessibilityLabel('Email address'), 'user@test.com');
    fireEvent.changeText(getByAccessibilityLabel('Password'), 'password123');
    fireEvent.press(getByAccessibilityLabel('Sign in'));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        'https://test.example.com',
        'user@test.com',
        'password123'
      );
    });
  });
});
