"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScanLine, QrCode, Search } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { getScanPath, getScanToken } from "@/lib/url";
import { Header } from "@/components/Navigation";
import { Button } from "@/components/ui/Button";
import type { StorageLocation } from "@/types";

function isLiveCameraSupported(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
}

async function resolveScanNavigation(decodedText: string): Promise<string | null> {
  const token = getScanToken(decodedText);
  if (token) {
    const res = await fetch(`/api/locations/by-token/${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string };
    return `/locations/${data.id}`;
  }

  return getScanPath(decodedText);
}

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigatingRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [liveCameraAvailable, setLiveCameraAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StorageLocation[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setLiveCameraAvailable(isLiveCameraSupported());
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/locations?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => res.json())
        .then((data: StorageLocation[]) => setSearchResults(Array.isArray(data) ? data : []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function stopScanner() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function navigateToScanTarget(decodedText: string) {
    if (navigatingRef.current) return false;

    setError("");
    navigatingRef.current = true;

    try {
      await stopScanner();

      const path = await resolveScanNavigation(decodedText);
      if (!path) {
        setError("QR-код не распознан или место не найдено.");
        navigatingRef.current = false;
        return false;
      }

      router.push(path);
      return true;
    } catch {
      setError("Ошибка при открытии места хранения. Попробуйте ещё раз.");
      navigatingRef.current = false;
      return false;
    }
  }

  async function startScanner() {
    setError("");
    navigatingRef.current = false;
    setScanning(true);

    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode("qr-reader", { verbose: false });
      scannerRef.current = scanner;

      let cameraId: string | { facingMode: string } = { facingMode: "environment" };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length > 0) {
          const back =
            cameras.find((c) => /back|rear|environment|задн/i.test(c.label)) ??
            cameras[cameras.length - 1];
          cameraId = back.id;
        }
      } catch {
        // use facingMode fallback
      }

      await scanner.start(
        cameraId,
        {
          fps: 8,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.75);
            return { width: size, height: size };
          },
          aspectRatio: 1,
        },
        (decodedText) => {
          void navigateToScanTarget(decodedText);
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("NotAllowedError") || message.includes("Permission")) {
        setError("Доступ к камере запрещён. Разрешите камеру в настройках браузера.");
      } else {
        setError("Не удалось открыть камеру.");
      }
    }
  }

  return (
    <div>
      <Header title="Сканер QR" backHref="/" />

      <div className="mx-auto max-w-lg px-4 py-6 md:px-8">
        <div className="mb-4 flex justify-end">
          <Link href="/qr-codes">
            <Button variant="secondary" size="sm">
              <QrCode className="h-4 w-4" />
              Все QR-коды
            </Button>
          </Link>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Отсканируйте QR-код места хранения или найдите место по названию.
        </p>

        {liveCameraAvailable && (
          <div>
            <div
              id="qr-reader"
              className={`qr-reader overflow-hidden rounded-2xl bg-black ${scanning ? "block min-h-[280px]" : "hidden"}`}
            />

            {!scanning ? (
              <Button className="w-full" onClick={startScanner}>
                <ScanLine className="h-4 w-4" />
                Сканировать QR-код
              </Button>
            ) : (
              <Button variant="secondary" className="mt-3 w-full" onClick={stopScanner}>
                Остановить
              </Button>
            )}
          </div>
        )}

        {!liveCameraAvailable && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Камера доступна только по HTTPS. Используйте поиск по названию ниже.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Search className="h-4 w-4" />
            Поиск по названию места
          </p>
          <input
            type="search"
            placeholder="Например: Шкаф, Кристалл..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {searching && (
            <p className="mt-2 text-xs text-slate-500">Поиск...</p>
          )}

          {!searching && searchQuery.trim() && searchResults.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">Места не найдены</p>
          )}

          {searchResults.length > 0 && (
            <ul className="mt-3 space-y-2">
              {searchResults.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/locations/${loc.id}`)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary-light"
                  >
                    <p className="font-medium text-slate-900">{loc.name}</p>
                    {loc.parent && (
                      <p className="mt-0.5 text-xs text-slate-500">в «{loc.parent.name}»</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
