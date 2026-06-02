import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/public-url";
import { getQrPayload, getQrScanUrl } from "@/lib/url";
import { getRequestUserId } from "@/lib/auth";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { token } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "token";
  const baseParam = request.nextUrl.searchParams.get("base");

  const location = await prisma.storageLocation.findFirst({
    where: { qrToken: token, userId },
    select: { id: true, name: true, qrToken: true },
  });

  if (!location?.qrToken) {
    return NextResponse.json({ error: "QR-код не найден" }, { status: 404 });
  }

  const payload =
    format === "url"
      ? getQrScanUrl(location.qrToken, getPublicBaseUrl(request, baseParam))
      : getQrPayload(location.qrToken);

  const png = await QRCode.toBuffer(payload, {
    type: "png",
    width: 512,
    margin: 2,
    color: { dark: "#064e3b", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "X-QR-Payload": payload,
    },
  });
}
