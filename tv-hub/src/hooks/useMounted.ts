'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void): () => void {
  // No-op: the mounted state only changes once (on mount)
  // We call callback immediately to signal the store has "updated"
  // But since useSyncExternalStore calls getSnapshot synchronously,
  // we just need the subscription mechanism to exist.
  void callback;
  return () => {};
}

function getSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * A hydration-safe hook that returns true only after the component
 * has mounted on the client. Uses useSyncExternalStore for consistency.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
