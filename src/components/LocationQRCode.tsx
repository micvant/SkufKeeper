"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getClientBaseUrl } from "@/lib/url";

interface LocationQRCodeProps {
  qrToken: string;
  locationName: string;
  showLabel?: boolean;
}

export function LocationQRCode({ qrToken, locationName, showLabel = true }: LocationQRCodeProps) {
  const qrSrc = `/api/qr/${qrToken}`;
  const scanUrl = `${getClientBaseUrl()}/l/${qrToken}`;

  function handleDownload() {
    const link = document.createElement("a");
    link.href = qrSrc;
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

      <p className="mt-3 break-all text-center text-xs text-slate-400">{scanUrl}</p>

      <div className="mt-4 flex justify-center">
        <Button variant="secondary" size="sm" type="button" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Скачать PNG
        </Button>
      </div>
    </div>
  );
}
