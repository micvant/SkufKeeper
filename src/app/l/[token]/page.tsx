"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { getOfflineLocationByQrToken } from "@/lib/offline-store";

export default function QrRedirectPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    params.then(({ token }) => {
      fetch(`/api/locations/by-token/${encodeURIComponent(token)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("not found");
          return res.json();
        })
        .then((data: { id: string }) => {
          if (!cancelled && data.id) {
            router.replace(`/locations/${data.id}`);
          }
        })
        .catch(() => {
          if (cancelled) return;
          const cached = getOfflineLocationByQrToken(token);
          if (cached?.locationId) {
            setOffline(true);
            router.replace(`/locations/${cached.locationId}`);
            return;
          }
          setError(true);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  if (error) {
    return (
      <div>
        <Header title="QR-код" backHref="/scan" />
        <div className="px-4 py-20 text-center">
          <p className="text-slate-500">Место хранения не найдено</p>
          <p className="mt-2 text-sm text-slate-400">
            Откройте это место онлайн хотя бы раз — тогда QR будет работать без сети.
          </p>
          <Link href="/scan" className="mt-4 inline-block text-primary">
            К сканеру
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-slate-500">
        {offline ? "Открываем из офлайн-кэша…" : "Открываем место хранения..."}
      </p>
    </div>
  );
}
