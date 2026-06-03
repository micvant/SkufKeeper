import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";

type Params = { params: Promise<{ locationId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { locationId } = await params;

  await prisma.locationFavorite.deleteMany({
    where: { userId, locationId },
  });

  return NextResponse.json({ success: true });
}
