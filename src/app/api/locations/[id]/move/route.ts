import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wouldCreateLocationCycle } from "@/lib/location-move";
import { getRequestUserId } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const parentId =
      body.parentId === null || body.parentId === ""
        ? null
        : (body.parentId as string)?.trim() || null;

    const existing = await prisma.storageLocation.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
    }

    if (parentId) {
      const parent = await prisma.storageLocation.findFirst({ where: { id: parentId, userId } });
      if (!parent) {
        return NextResponse.json({ error: "Родительское место не найдено" }, { status: 404 });
      }
    }

    if (await wouldCreateLocationCycle(id, parentId, userId)) {
      return NextResponse.json(
        { error: "Нельзя переместить место внутрь самого себя или своих вложенных мест" },
        { status: 400 }
      );
    }

    const location = await prisma.storageLocation.update({
      where: { id: existing.id },
      data: { parentId },
      include: {
        _count: { select: { items: true, children: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка перемещения";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
