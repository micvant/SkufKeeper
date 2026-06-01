"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { extractLocationId } from "@/lib/url";
import { Header } from "@/components/Navigation";
import { Button } from "@/components/ui/Button";

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [manualId, setManualId] = useState("");

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  async function startScanner() {
    setError("");

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const locationId = extractLocationId(decodedText);
          if (locationId) {
            scanner.stop().catch(() => {});
            setScanning(false);
            router.push(`/locations/${locationId}`);
          }
        },
        () => {}
      );

      setScanning(true);
    } catch {
      setError("Не удалось открыть камеру. Разрешите доступ к камере в настройках браузера.");
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }

  function handleManualOpen() {
    const locationId = extractLocationId(manualId);
    if (locationId) {
      router.push(`/locations/${locationId}`);
    } else {
      setError("Не удалось распознать ссылку или ID места");
    }
  }

  return (
    <div>
      <Header title="Сканер QR" backHref="/" />

      <div className="mx-auto max-w-lg px-4 py-6 md:px-8">
        <p className="mb-4 text-sm text-slate-600">
          Наведите камеру на QR-код места хранения, чтобы открыть список объектов внутри.
        </p>

        <div
          id="qr-reader"
          className={`overflow-hidden rounded-2xl bg-black ${scanning ? "block" : "hidden"}`}
        />

        {!scanning && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">Камера выключена</p>
            <Button className="mt-4" onClick={startScanner}>
              Включить камеру
            </Button>
          </div>
        )}

        {scanning && (
          <Button variant="secondary" className="mt-4 w-full" onClick={stopScanner}>
            Остановить
          </Button>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="mb-2 text-sm font-medium text-slate-700">Или вставьте ссылку вручную</p>
          <input
            type="text"
            placeholder="http://.../locations/..."
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <Button variant="secondary" className="mt-3 w-full" onClick={handleManualOpen}>
            Открыть место
          </Button>
        </div>
      </div>
    </div>
  );
}
