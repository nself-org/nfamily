/**
 * Purpose: Network connectivity hook — tracks online/offline state via RN NetInfo.
 * Inputs:  none
 * Outputs: { isOnline: boolean }
 * Constraints: Lightweight — does not import @react-native-community/netinfo to avoid
 *   missing native module at scaffold stage. Uses fetch-based heartbeat as fallback.
 *   Replace with NetInfo.addEventListener when native module is linked.
 * SPORT: MASTER-HOOKS.md
 */

import { useState, useEffect, useRef } from 'react';

interface NetworkState {
  isOnline: boolean;
}

/** Heartbeat interval in ms. */
const HEARTBEAT_MS = 10_000;

/**
 * Probe connectivity by fetching a tiny resource.
 * Uses the nSelf backend health endpoint if available; falls back to a public CDN.
 */
async function probeConnectivity(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch('https://1.1.1.1', {
      method: 'HEAD',
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Track network connectivity. Polls every 10 s as a lightweight alternative
 * to native NetInfo until the module is linked.
 */
export function useNetworkState(): NetworkState {
  const [isOnline, setIsOnline] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const online = await probeConnectivity();
      if (active) setIsOnline(online);
    };

    // Initial check
    void check();

    // Periodic heartbeat
    intervalRef.current = setInterval(() => {
      void check();
    }, HEARTBEAT_MS);

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isOnline };
}
