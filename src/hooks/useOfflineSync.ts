/**
 * Purpose: Offline sync hook — flushes the MMKV/AsyncStorage offline queue when online.
 * Inputs:  isOnline (boolean), flushFn (async callback per entry)
 * Outputs: { pendingCount, flush } — triggered automatically on reconnect
 * Constraints: One flush at a time. Entries are dequeued on success; retried (max 3) on error.
 *   Callers provide the flushFn — this hook only orchestrates queue drain.
 * SPORT: MASTER-HOOKS.md
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getQueue,
  dequeue,
  markRetry,
} from '../lib/offline-queue';
import type { OfflineQueueEntry } from '../types';

const MAX_RETRIES = 3;

interface UseOfflineSyncOptions {
  isOnline: boolean;
  flushFn: (entry: OfflineQueueEntry) => Promise<void>;
}

interface UseOfflineSyncReturn {
  pendingCount: number;
  flush: () => Promise<void>;
}

export function useOfflineSync({
  isOnline,
  flushFn,
}: UseOfflineSyncOptions): UseOfflineSyncReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const isFlushing = useRef(false);

  const refreshCount = useCallback(async () => {
    const q = await getQueue();
    setPendingCount(q.length);
  }, []);

  const flush = useCallback(async () => {
    if (isFlushing.current || !isOnline) return;
    isFlushing.current = true;

    try {
      const entries = await getQueue();
      for (const entry of entries) {
        if (entry.retryCount >= MAX_RETRIES) {
          // Give up on this entry
          await dequeue(entry.id);
          continue;
        }
        try {
          await flushFn(entry);
          await dequeue(entry.id);
        } catch {
          await markRetry(entry.id);
        }
      }
    } finally {
      isFlushing.current = false;
      await refreshCount();
    }
  }, [isOnline, flushFn, refreshCount]);

  // Auto-flush when coming back online
  useEffect(() => {
    if (isOnline) {
      void flush();
    }
  }, [isOnline, flush]);

  // Refresh count on mount
  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  return { pendingCount, flush };
}
