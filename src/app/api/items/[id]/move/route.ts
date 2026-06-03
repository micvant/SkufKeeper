import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import { createItemMoveLog } from "@/lib/item-move-log";
import { customFieldsInclude, serializeEntityWithCustomFields } from "@/lib/custom-field";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const locationId = String(body.locationId ?? "").trim();
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";

  if (!locationId) {
    return NextResponse.json({ error: "Укажите место хранения" }, { status: 400 });
  }

  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: { location: { select: { id: true, name: true } } },
  });
  if (!item) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  if (item.locationId === locationId) {
    return NextResponse.json({ error: "Объект уже в этом месте" }, { status: 400 });
  }

  const target = await prisma.storageLocation.findFirst({
    where: { id: locationId, userId },
    select: { id: true, name: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Место хранения не найдено" }, { status: 404 });
  }

  const updated = await prisma.item.update({
    where: { id: item.id },
    data: { locationId: target.id },
    include: {
      location: { select: { id: true, name: true } },
      ...customFieldsInclude,
    },
  });

  await createItemMoveLog({
    userId,
    itemId: item.id,
    fromLocationId: item.locationId,
    fromLocationName: item.location.name,
    toLocationId: target.id,
    toLocationName: target.name,
    comment: comment || null,
  });

  return NextResponse.json(serializeEntityWithCustomFields(updated));
}
