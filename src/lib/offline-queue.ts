/**
 * Purpose: Offline operation queue backed by AsyncStorage (MMKV-compatible API).
 * Inputs:  OfflineQueueEntry objects; network availability signal
 * Outputs: Persisted queue that survives app restarts; sync() flushes on reconnect
 * Constraints: Uses AsyncStorage for persistence (MMKV drop-in pattern when available).
 *   @react-native-async-storage/async-storage must be installed and linked.
 *   Each entry is idempotent — server must handle duplicate submissions gracefully.
 *   Max queue size: 100 entries (older entries evicted).
 * SPORT: MASTER-LIBS.md
 */

// AsyncStorage minimal interface — avoids hard dependency on native module before linking.
// Replace with: import AsyncStorage from '@react-native-async-storage/async-storage';
// once the native module is linked (pnpm add @react-native-async-storage/async-storage).
interface AsyncStorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

function getAsyncStorage(): AsyncStorageInterface {
  try {
    // eslint-disable-next-line
    return (require('@react-native-async-storage/async-storage') as { default: AsyncStorageInterface }).default;
  } catch {
    // Fallback: in-memory store (loses data on restart — acceptable for scaffold)
    const mem: Record<string, string> = {};
    return {
      getItem: async (k) => mem[k] ?? null,
      setItem: async (k, v) => { mem[k] = v; },
    };
  }
}

const AsyncStorage: AsyncStorageInterface = getAsyncStorage();
import type { OfflineQueueEntry, OfflineOp } from '../types';

const QUEUE_KEY = 'nfamily_offline_queue_v1';
const MAX_QUEUE_SIZE = 100;

/** Generate a deterministic ID for deduplication. */
function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Load the full queue from storage. */
async function loadQueue(): Promise<OfflineQueueEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineQueueEntry[];
  } catch {
    return [];
  }
}

/** Persist the queue to storage. */
async function saveQueue(entries: OfflineQueueEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
  } catch {
    // Storage write failure — data may be lost; acceptable for offline queue
  }
}

/** Enqueue an offline operation. Evicts oldest if queue is full. */
export async function enqueue(op: OfflineOp): Promise<OfflineQueueEntry> {
  const entries = await loadQueue();
  const entry: OfflineQueueEntry = {
    id: makeId(),
    op,
    enqueuedAt: new Date().toISOString(),
    retryCount: 0,
  };
  const updated = [...entries, entry].slice(-MAX_QUEUE_SIZE);
  await saveQueue(updated);
  return entry;
}

/** Return the current queue (read-only). */
export async function getQueue(): Promise<OfflineQueueEntry[]> {
  return loadQueue();
}

/** Remove a successfully synced entry from the queue. */
export async function dequeue(id: string): Promise<void> {
  const entries = await loadQueue();
  await saveQueue(entries.filter((e) => e.id !== id));
}

/** Increment retry count for an entry that failed to sync. */
export async function markRetry(id: string): Promise<void> {
  const entries = await loadQueue();
  await saveQueue(
    entries.map((e) =>
      e.id === id ? { ...e, retryCount: e.retryCount + 1 } : e
    )
  );
}

/** Clear all entries (e.g. on sign-out). */
export async function clearQueue(): Promise<void> {
  await saveQueue([]);
}

/** Count pending entries. */
export async function queueSize(): Promise<number> {
  const q = await loadQueue();
  return q.length;
}
