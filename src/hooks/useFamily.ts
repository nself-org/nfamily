/**
 * Purpose: Family members list hook — fetches and caches family roster from Hasura.
 * Inputs:  serverUrl (string), authToken (string)
 * Outputs: { members, isLoading, error, refetch }
 * Constraints: requires active Hasura connection; returns empty array on auth failure.
 *   Deferred until P-FAM-5+ when Hasura schema is available.
 * SPORT: MASTER-HOOKS.md
 */

import { useState, useEffect, useCallback } from 'react';
import type { FamilyMember } from '../types';

interface UseFamilyReturn {
  members: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFamily(serverUrl: string, authToken: string | null): UseFamilyReturn {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!authToken || !serverUrl) return;
    setIsLoading(true);
    setError(null);

    // TODO(P-FAM-5): replace with Apollo Client query to np_family_members table
    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 300));
        // Placeholder roster — real data from Hasura GraphQL in P-FAM-5
        const placeholder: FamilyMember[] = [
          {
            id: '1',
            displayName: 'You',
            email: '',
            relationship: 'owner',
            joinedAt: new Date().toISOString(),
          },
        ];
        setMembers(placeholder);
      } catch (e) {
        setError('Failed to load family members.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [serverUrl, authToken, trigger]);

  const refetch = useCallback(() => setTrigger((t) => t + 1), []);

  return { members, isLoading, error, refetch };
}
