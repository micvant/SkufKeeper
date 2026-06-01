"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ScanLine } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { getScanPath } from "@/lib/url";
import { Header } from "@/components/Navigation";
import { Button } from "@/components/ui/Button";

function isLiveCameraSupported(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext;
}

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [manualId, setManualId] = useState("");
  const [liveCameraAvailable, setLiveCameraAvailable] = useState(false);

  useEffect(() => {
    setLiveCameraAvailable(isLiveCameraSupported());
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  function navigateToScanTarget(decodedText: string) {
    const path = getScanPath(decodedText);
    if (path) {
      router.push(path);
      return true;
    }
    setError("QR-код не распознан или не относится к месту хранения SkufKeeper");
    return false;
  }

  async function handlePhotoScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setProcessing(true);

    try {
      const scanner = new Html5Qrcode("qr-file-scanner");
      const decodedText = await scanner.scanFile(file, false);
      navigateToScanTarget(decodedText);
    } catch {
      setError("Не удалось прочитать QR-код с фото. Попробуйте сфотографировать ближе и при хорошем освещении.");
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function startScanner() {
    setError("");

    if (!isLiveCameraSupported()) {
      setError(
        "Живая камера доступна только по HTTPS. Используйте «Сфотографировать QR-код» — это работает по HTTP."
      );
      return;
    }

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (navigateToScanTarget(decodedText)) {
            scanner.stop().catch(() => {});
            setScanning(false);
          }
        },
        () => {}
      );

      setScanning(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("NotAllowedError") || message.includes("Permission")) {
        setError("Доступ к камере запрещён. Разрешите камеру для Safari в Настройки → Safari → Камера.");
      } else {
        setError("Не удалось открыть камеру. Попробуйте сфотографировать QR-код.");
      }
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
    const path = getScanPath(manualId);
    if (path) {
      router.push(path);
    } else {
      setError("Не удалось распознать ссылку или QR-код места");
    }
  }

  return (
    <div>
      <Header title="Сканер QR" backHref="/" />

      <div className="mx-auto max-w-lg px-4 py-6 md:px-8">
        <p className="mb-4 text-sm text-slate-600">
          Отсканируйте QR-код места хранения, чтобы увидеть, что внутри.
        </p>

        <div id="qr-file-scanner" className="hidden" aria-hidden="true" />

        {/* Primary method — works on iPhone over HTTP */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-medium text-emerald-900">Сфотографировать QR-код</p>
          <p className="mt-1 text-xs text-emerald-700">
            Рекомендуется для iPhone. Открывает камеру без запроса HTTPS.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoScan}
          />
          <Button
            className="mt-4 w-full"
            disabled={processing}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {processing ? "Распознавание..." : "Сфотографировать QR-код"}
          </Button>
        </div>

        {/* Live scanner — HTTPS / localhost only */}
        {liveCameraAvailable && (
          <div className="mt-4">
            <div
              id="qr-reader"
              className={`overflow-hidden rounded-2xl bg-black ${scanning ? "block" : "hidden"}`}
            />

            {!scanning ? (
              <Button variant="secondary" className="w-full" onClick={startScanner}>
                <ScanLine className="h-4 w-4" />
                Сканировать в реальном времени
              </Button>
            ) : (
              <Button variant="secondary" className="mt-4 w-full" onClick={stopScanner}>
                Остановить
              </Button>
            )}
          </div>
        )}

        {!liveCameraAvailable && (
          <p className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
            Живая камера недоступна по HTTP (только HTTPS). Для iPhone используйте кнопку «Сфотографировать QR-код» выше.
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="mb-2 text-sm font-medium text-slate-700">Или вставьте ссылку вручную</p>
          <input
            type="text"
            placeholder="http://.../l/... или /locations/..."
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
