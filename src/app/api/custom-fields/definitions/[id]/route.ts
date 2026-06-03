import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(_request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.customFieldDefinition.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Поле не найдено" }, { status: 404 });
  }

  await prisma.customFieldDefinition.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}
