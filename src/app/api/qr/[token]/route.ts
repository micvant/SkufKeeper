import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getQrScanUrl } from "@/lib/url";

type Params = { params: Promise<{ token: string }> };

function getBaseUrlFromRequest(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = await params;

  const location = await prisma.storageLocation.findUnique({
    where: { qrToken: token },
    select: { id: true, name: true, qrToken: true },
  });

  if (!location?.qrToken) {
    return NextResponse.json({ error: "QR-код не найден" }, { status: 404 });
  }

  const url = getQrScanUrl(location.qrToken, getBaseUrlFromRequest(request));
  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: { dark: "#064e3b", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
