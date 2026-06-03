"use client";

import { useEffect } from "react";
import { isNetworkOnline } from "@/lib/offline-sync";

/**
 * Suppresses unhandled RSC/network errors when the connection drops.
 */
export function OfflineAwareLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function onUnhandled(event: PromiseRejectionEvent) {
      if (isNetworkOnline()) return;
      const reason = event.reason;
      const message =
        reason instanceof Error ? reason.message : String(reason ?? "");
      if (
        message.includes("Failed to fetch") ||
        message.includes("NetworkError") ||
        message.includes("Load failed") ||
        message.includes("offline")
      ) {
        event.preventDefault();
      }
    }

    function onOffline() {
      /* noop — avoid automatic refresh while offline */
    }

    window.addEventListener("unhandledrejection", onUnhandled);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandled);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return <>{children}</>;
}
