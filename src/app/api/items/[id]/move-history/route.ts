import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  const item = await prisma.item.findFirst({ where: { id, userId }, select: { id: true } });
  if (!item) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  const logs = await prisma.itemMoveLog.findMany({
    where: { itemId: id, userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}
