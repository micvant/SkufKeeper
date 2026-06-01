import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;

  const location = await prisma.storageLocation.findUnique({
    where: { id },
    select: { qrToken: true },
  });

  if (!location?.qrToken) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  const url = new URL(`/api/qr/${location.qrToken}`, request.url);
  return NextResponse.redirect(url);
}
