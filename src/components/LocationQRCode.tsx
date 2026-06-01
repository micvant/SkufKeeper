"use client";

import { useState } from "react";
import Image from "next/image";
import { QrCode, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getClientBaseUrl } from "@/lib/url";

interface LocationQRCodeProps {
  locationId: string;
  locationName: string;
}

export function LocationQRCode({ locationId, locationName }: LocationQRCodeProps) {
  const [open, setOpen] = useState(false);
  const qrSrc = `/api/locations/${locationId}/qr?t=${open ? Date.now() : 0}`;

  function handleDownload() {
    const link = document.createElement("a");
    link.href = `/api/locations/${locationId}/qr`;
    link.download = `skufkeeper-${locationName.replace(/\s+/g, "-")}.png`;
    link.click();
  }

  return (
    <div>
      <Button variant="secondary" size="sm" type="button" onClick={() => setOpen(!open)}>
        <QrCode className="h-4 w-4" />
        QR-код
      </Button>

      {open && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="mb-1 text-sm font-medium text-slate-900">{locationName}</p>
          <p className="mb-4 text-xs text-slate-500">
            Наклейте QR на место хранения — отсканируйте, чтобы увидеть содержимое
          </p>

          <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white">
            <Image
              src={qrSrc}
              alt={`QR-код: ${locationName}`}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>

          <p className="mt-3 break-all text-xs text-slate-400">
            {getClientBaseUrl()}/locations/{locationId}
          </p>

          <Button variant="secondary" size="sm" className="mt-4" type="button" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Скачать PNG
          </Button>
        </div>
      )}
    </div>
  );
}
