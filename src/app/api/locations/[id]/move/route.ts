import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wouldCreateLocationCycle } from "@/lib/location-move";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parentId =
      body.parentId === null || body.parentId === ""
        ? null
        : (body.parentId as string)?.trim() || null;

    const existing = await prisma.storageLocation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
    }

    if (parentId) {
      const parent = await prisma.storageLocation.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Родительское место не найдено" }, { status: 404 });
      }
    }

    if (await wouldCreateLocationCycle(id, parentId)) {
      return NextResponse.json(
        { error: "Нельзя переместить место внутрь самого себя или своих вложенных мест" },
        { status: 400 }
      );
    }

    const location = await prisma.storageLocation.update({
      where: { id },
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
