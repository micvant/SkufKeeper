"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, ScanLine, QrCode } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { getScanPath, getScanToken } from "@/lib/url";
import { Header } from "@/components/Navigation";
import { Button } from "@/components/ui/Button";

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
        setError(
          "QR-код не распознан или место не найдено. Откройте код в разделе «Все QR-коды»."
        );
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

  async function handlePhotoScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setProcessing(true);
    navigatingRef.current = false;

    try {
      const scanner = new Html5Qrcode("qr-file-scanner");
      const decodedText = await scanner.scanFile(file, false);
      await navigateToScanTarget(decodedText);
    } catch {
      setError("Не удалось прочитать QR-код с фото. Попробуйте сфотографировать ближе и при хорошем освещении.");
      navigatingRef.current = false;
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        setError("Доступ к камере запрещён. Разрешите камеру для Safari в Настройки → Safari → Камера.");
      } else if (/iPhone|iPad|iOS/i.test(navigator.userAgent)) {
        setError(
          "На iPhone надёжнее «Сфотографировать QR-код». Живой сканер использует видеопоток и может работать нестабильно."
        );
      } else {
        setError("Не удалось открыть камеру. Попробуйте сфотографировать QR-код.");
      }
    }
  }

  async function handleManualOpen() {
    navigatingRef.current = false;
    await navigateToScanTarget(manualId);
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
          Отсканируйте QR-код места хранения. Коды не зависят от домена сайта.
        </p>

        <div id="qr-file-scanner" className="hidden" aria-hidden="true" />

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-medium text-emerald-900">Сфотографировать QR-код</p>
          <p className="mt-1 text-xs text-emerald-700">Рекомендуется для iPhone</p>
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

        {liveCameraAvailable && (
          <div className="mt-4">
            <div
              id="qr-reader"
              className={`qr-reader overflow-hidden rounded-2xl bg-black ${scanning ? "block min-h-[280px]" : "hidden"}`}
            />

            {!scanning ? (
              <Button variant="secondary" className="mt-4 w-full" onClick={startScanner}>
                <ScanLine className="h-4 w-4" />
                Сканировать в реальном времени
              </Button>
            ) : (
              <>
                <p className="mt-2 text-center text-xs text-slate-500">
                  Наведите камеру на QR-код. Это режим видео — на iPhone лучше использовать фото выше.
                </p>
                <Button variant="secondary" className="mt-3 w-full" onClick={stopScanner}>
                  Остановить
                </Button>
              </>
            )}
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="mb-2 text-sm font-medium text-slate-700">Или введите код вручную</p>
          <input
            type="text"
            placeholder="skufkeeper:l/abc123..."
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
