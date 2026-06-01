import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/public-url";
import { getQrScanUrl } from "@/lib/url";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const baseParam = request.nextUrl.searchParams.get("base");

  const location = await prisma.storageLocation.findUnique({
    where: { qrToken: token },
    select: { id: true, name: true, qrToken: true },
  });

  if (!location?.qrToken) {
    return NextResponse.json({ error: "QR-код не найден" }, { status: 404 });
  }

  const baseUrl = getPublicBaseUrl(request, baseParam);
  const url = getQrScanUrl(location.qrToken, baseUrl);
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
      "X-QR-URL": url,
    },
  });
}
