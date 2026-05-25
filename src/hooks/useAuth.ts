/**
 * Purpose: Auth state hook — manages nSelf server URL, credentials, and session token.
 * Inputs:  none (reads from SecureStore on mount)
 * Outputs: { authState, signIn, signOut, isLoading }
 * Constraints: Token stored via expo-secure-store. SDK integration deferred to P-FAM-4+.
 *   Current implementation simulates auth; real NselfAuthClient wired in P-FAM-4.
 * SPORT: MASTER-HOOKS.md
 */

import { useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { AuthState } from '../types';

const KEYS = {
  serverUrl: 'nfamily_server_url',
  email: 'nfamily_email',
  token: 'nfamily_token',
} as const;

interface UseAuthReturn {
  authState: AuthState;
  isLoading: boolean;
  signIn: (serverUrl: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    serverUrl: '',
    email: '',
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore persisted session on mount
  useEffect(() => {
    (async () => {
      try {
        const [serverUrl, email, token] = await Promise.all([
          SecureStore.getItemAsync(KEYS.serverUrl),
          SecureStore.getItemAsync(KEYS.email),
          SecureStore.getItemAsync(KEYS.token),
        ]);
        if (token && serverUrl && email) {
          setAuthState({ serverUrl, email, token, isAuthenticated: true });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(
    async (serverUrl: string, email: string, _password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO(P-FAM-4): replace with NselfAuthClient.signIn(serverUrl, email, password)
        // Placeholder simulates auth during scaffolding phase.
        await new Promise((r) => setTimeout(r, 500));
        const token = 'placeholder-token-p-fam-4';

        await Promise.all([
          SecureStore.setItemAsync(KEYS.serverUrl, serverUrl),
          SecureStore.setItemAsync(KEYS.email, email),
          SecureStore.setItemAsync(KEYS.token, token),
        ]);
        setAuthState({ serverUrl, email, token, isAuthenticated: true });
      } catch (e) {
        setError('Sign-in failed. Check your server URL and credentials.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.serverUrl),
      SecureStore.deleteItemAsync(KEYS.email),
      SecureStore.deleteItemAsync(KEYS.token),
    ]);
    setAuthState({ serverUrl: '', email: '', token: null, isAuthenticated: false });
  }, []);

  return { authState, isLoading, signIn, signOut, error };
}
