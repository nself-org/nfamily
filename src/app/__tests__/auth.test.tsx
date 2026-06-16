/**
 * Purpose: Smoke + unit tests for AuthScreen.
 * Inputs:  Rendered AuthScreen component
 * Outputs: Jest test results
 * Constraints: Mocks useAuth hook; does not exercise SecureStore I/O.
 *   Note: Sign-in now has two steps — credentials -> COPPA DOB -> signIn.
 *   These tests cover the credentials step; COPPA is tested in coppa.test.ts.
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

  it('renders sign-in form with all required fields', () => {
    const { getByLabelText } = render(<AuthScreen />);
    expect(getByLabelText('Server URL')).toBeTruthy();
    expect(getByLabelText('Email address')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
    expect(getByLabelText('Sign in')).toBeTruthy();
  });

  it('shows validation error when fields are empty', async () => {
    const { getByLabelText, getByText } = render(<AuthScreen />);
    fireEvent.press(getByLabelText('Sign in'));
    await waitFor(() => {
      expect(getByText('All fields are required.')).toBeTruthy();
    });
  });

  it('advances to COPPA DOB step when credentials are filled', async () => {
    const { getByLabelText, getByText } = render(<AuthScreen />);
    fireEvent.changeText(getByLabelText('Server URL'), 'https://test.example.com');
    fireEvent.changeText(getByLabelText('Email address'), 'user@test.com');
    fireEvent.changeText(getByLabelText('Password'), 'password123');
    fireEvent.press(getByLabelText('Sign in'));
    // After pressing Sign in with valid credentials, COPPA DOB screen appears
    await waitFor(() => {
      expect(getByText("What's your date of birth?")).toBeTruthy();
    });
  });
});
