"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export function ServiceWorkerRegister() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const syncOnline = () => setOffline(!navigator.onLine);
    syncOnline();
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 border-t border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 safe-bottom md:left-56">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>Нет подключения — доступны сохранённые страницы</span>
      <Link href="/offline" className="font-medium underline">
        Подробнее
      </Link>
    </div>
  );
}
