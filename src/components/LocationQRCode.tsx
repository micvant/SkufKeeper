"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LocationQRCodeProps {
  qrToken: string;
  locationName: string;
  showLabel?: boolean;
}

function resolveClientBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;

  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return origin;
    }
  }

  return "";
}

export function LocationQRCode({ qrToken, locationName, showLabel = true }: LocationQRCodeProps) {
  const [baseUrl, setBaseUrl] = useState(resolveClientBaseUrl);
  const scanUrl = baseUrl ? `${baseUrl}/l/${qrToken}` : "";
  const qrSrc = useMemo(
    () =>
      baseUrl
        ? `/api/qr/${qrToken}?base=${encodeURIComponent(baseUrl)}`
        : `/api/qr/${qrToken}`,
    [baseUrl, qrToken]
  );

  useEffect(() => {
    if (baseUrl) return;

    fetch("/api/config")
      .then((res) => res.json())
      .then((data: { baseUrl?: string }) => {
        if (data.baseUrl) setBaseUrl(data.baseUrl);
      })
      .catch(() => {});
  }, [baseUrl]);

  function handleDownload() {
    const link = document.createElement("a");
    link.href = baseUrl
      ? `/api/qr/${qrToken}?base=${encodeURIComponent(baseUrl)}`
      : `/api/qr/${qrToken}`;
    link.download = `skufkeeper-${locationName.replace(/\s+/g, "-")}.png`;
    link.click();
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
      {showLabel && (
        <>
          <p className="text-sm font-medium text-slate-900">QR-код места хранения</p>
          <p className="mt-1 text-xs text-slate-500">
            Уникальный код — наклейте на шкаф или ящик и сканируйте через «Сканер»
          </p>
        </>
      )}

      <div className="relative mx-auto mt-4 h-52 w-52 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
        <Image
          src={qrSrc}
          alt={`QR-код: ${locationName}`}
          fill
          className="object-contain p-2"
          unoptimized
        />
      </div>

      {scanUrl && (
        <p className="mt-3 break-all text-center text-xs text-slate-400">{scanUrl}</p>
      )}

      <div className="mt-4 flex justify-center">
        <Button variant="secondary" size="sm" type="button" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Скачать PNG
        </Button>
      </div>
    </div>
  );
}
