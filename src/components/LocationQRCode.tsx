"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getQrPayload } from "@/lib/url";

interface LocationQRCodeProps {
  qrToken: string;
  locationName: string;
  locationId?: string;
  showLabel?: boolean;
  embedded?: boolean;
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

export function LocationQRCode({
  qrToken,
  locationName,
  locationId,
  showLabel = true,
  embedded = false,
}: LocationQRCodeProps) {
  const [baseUrl, setBaseUrl] = useState(resolveClientBaseUrl);
  const tokenPayload = getQrPayload(qrToken);
  const urlPayload = baseUrl ? `${baseUrl}/l/${qrToken}` : "";

  const qrSrc = useMemo(() => `/api/qr/${qrToken}?format=token`, [qrToken]);
  const qrUrlSrc = useMemo(
    () =>
      baseUrl
        ? `/api/qr/${qrToken}?format=url&base=${encodeURIComponent(baseUrl)}`
        : `/api/qr/${qrToken}?format=url`,
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

  function download(format: "token" | "url") {
    const link = document.createElement("a");
    link.href =
      format === "url" && baseUrl
        ? `/api/qr/${qrToken}?format=url&base=${encodeURIComponent(baseUrl)}`
        : `/api/qr/${qrToken}?format=token`;
    link.download = `skufkeeper-${locationName.replace(/\s+/g, "-")}.png`;
    link.click();
  }

  return (
    <div
      className={
        embedded
          ? undefined
          : "rounded-2xl border border-primary/20 bg-primary-light/50 p-5"
      }
    >
      {showLabel && (
        <p className="text-sm font-medium text-slate-900">QR-код места хранения</p>
      )}

      <div className="relative mx-auto mt-4 h-44 w-44 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
        <Image
          src={qrSrc}
          alt={`QR-код: ${locationName}`}
          fill
          className="object-contain p-2"
          unoptimized
        />
      </div>

      <p className="mt-3 break-all text-center text-xs text-slate-500">{tokenPayload}</p>

      {locationId && (
        <Link
          href={`/locations/${locationId}`}
          className="mt-2 flex items-center justify-center gap-1 text-xs text-primary hover:text-primary-hover"
        >
          <ExternalLink className="h-3 w-3" />
          Открыть место
        </Link>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button variant="secondary" size="sm" type="button" onClick={() => download("token")}>
          <Download className="h-4 w-4" />
          Скачать QR
        </Button>
        {baseUrl && (
          <Button variant="ghost" size="sm" type="button" onClick={() => download("url")}>
            <Download className="h-4 w-4" />
            QR со ссылкой
          </Button>
        )}
      </div>

      {urlPayload && (
        <p className="mt-2 break-all text-center text-[10px] text-slate-400">
          Ссылка для камеры iPhone: {urlPayload}
        </p>
      )}
    </div>
  );
}
