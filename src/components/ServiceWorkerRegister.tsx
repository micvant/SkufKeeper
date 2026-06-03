"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CloudOff, RefreshCw, WifiOff } from "lucide-react";
import { useOfflineSync } from "@/components/OfflineSyncProvider";

export function ServiceWorkerRegister() {
  const { online, queueCount, syncing, syncNow } = useOfflineSync();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  if (online && queueCount === 0) return null;

  return (
    <div
      className={`fixed inset-x-0 z-50 flex flex-wrap items-center justify-center gap-2 border-t px-4 py-2 text-xs safe-bottom md:left-56 ${
        online
          ? "border-primary/30 bg-primary-light text-primary"
          : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
      }`}
    >
      {!online ? (
        <>
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Офлайн — изменения сохраняются в очередь</span>
          <Link href="/offline" className="font-medium underline">
            Подробнее
          </Link>
        </>
      ) : (
        <>
          <CloudOff className="h-3.5 w-3.5 shrink-0" />
          <span>
            В очереди: {queueCount} {queueCount === 1 ? "изменение" : "изменений"}
          </span>
          <button
            type="button"
            onClick={() => syncNow()}
            disabled={syncing}
            className="inline-flex items-center gap-1 font-medium underline disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Синхронизация…" : "Синхронизировать"}
          </button>
        </>
      )}
    </div>
  );
}
