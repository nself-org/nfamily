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
  /**
   * Sign in / sign up against an nSelf backend.
   * @param dateOfBirth ISO "YYYY-MM-DD" — transmitted so the server enforces the
   *   COPPA age check authoritatively. The client UI gate (CoppaGateScreen) is a
   *   convenience only and MUST NOT be the sole enforcement (CR-C HIGH-1).
   */
  signIn: (
    serverUrl: string,
    email: string,
    password: string,
    dateOfBirth: string
  ) => Promise<void>;
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
    async (
      serverUrl: string,
      email: string,
      _password: string,
      dateOfBirth: string
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        // COPPA: the DOB is sent to the backend so the server performs the
        // authoritative age check. The client gate is bypassable, so server-side
        // enforcement is mandatory before this account is created (CR-C HIGH-1).
        // TODO(P-FAM-4): replace with
        //   NselfAuthClient.signIn(serverUrl, email, password, { dateOfBirth })
        // The real client MUST pass dateOfBirth so the nFamily plugin rejects
        // under-13 standalone account creation server-side.
        void dateOfBirth;
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
