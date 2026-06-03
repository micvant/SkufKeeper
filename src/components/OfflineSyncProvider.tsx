"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { flushOfflineQueue, isNetworkOnline } from "@/lib/offline-sync";
import { getQueueCount } from "@/lib/offline-queue";

interface OfflineSyncContextValue {
  online: boolean;
  queueCount: number;
  syncing: boolean;
  syncNow: () => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue>({
  online: true,
  queueCount: 0,
  syncing: false,
  syncNow: async () => {},
});

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshQueue = useCallback(() => {
    setQueueCount(getQueueCount());
  }, []);

  const syncNow = useCallback(async () => {
    if (!isNetworkOnline()) return;
    setSyncing(true);
    try {
      await flushOfflineQueue();
      refreshQueue();
    } finally {
      setSyncing(false);
    }
  }, [refreshQueue]);

  useEffect(() => {
    const updateOnline = () => setOnline(isNetworkOnline());
    updateOnline();
    refreshQueue();

    const onOnline = () => {
      updateOnline();
      syncNow();
    };
    const onOffline = () => {
      updateOnline();
      refreshQueue();
    };
    const onQueue = () => refreshQueue();

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("skufkeeper-queue-changed", onQueue);
    window.addEventListener("skufkeeper-sync-complete", onQueue);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("skufkeeper-queue-changed", onQueue);
      window.removeEventListener("skufkeeper-sync-complete", onQueue);
    };
  }, [syncNow, refreshQueue]);

  return (
    <OfflineSyncContext.Provider value={{ online, queueCount, syncing, syncNow }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  return useContext(OfflineSyncContext);
}
