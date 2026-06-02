import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  const location = await prisma.storageLocation.findFirst({
    where: { id, userId },
    select: { qrToken: true },
  });

  if (!location?.qrToken) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  const url = new URL(`/api/qr/${location.qrToken}`, request.url);
  return NextResponse.redirect(url);
}
