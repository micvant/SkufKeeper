import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import { DEFAULT_ITEM_UNIT, parseItemUnit } from "@/lib/item-units";

type BatchItemInput = {
  name?: string;
  quantity?: number;
  unit?: string;
};

export async function POST(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
    }

    const body = (await request.json()) as { locationId?: string; items?: BatchItemInput[] };
    const locationId = body.locationId?.trim();
    const rawItems = body.items;

    if (!locationId) {
      return NextResponse.json({ error: "locationId обязателен" }, { status: 400 });
    }
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "Список объектов пуст" }, { status: 400 });
    }
    if (rawItems.length > 50) {
      return NextResponse.json({ error: "Не более 50 объектов за раз" }, { status: 400 });
    }

    const location = await prisma.storageLocation.findFirst({
      where: { id: locationId, userId },
      select: { id: true },
    });
    if (!location) {
      return NextResponse.json({ error: "Место хранения не найдено" }, { status: 404 });
    }

    const prepared = rawItems
      .map((row) => {
        const name = row.name?.trim();
        if (!name) return null;
        let quantity = 1;
        if (typeof row.quantity === "number" && Number.isFinite(row.quantity)) {
          quantity = Math.max(0.001, row.quantity);
        }
        const unit = parseItemUnit(row.unit ?? DEFAULT_ITEM_UNIT);
        return { name, quantity, unit };
      })
      .filter((row): row is { name: string; quantity: number; unit: ReturnType<typeof parseItemUnit> } =>
        Boolean(row)
      );

    if (prepared.length === 0) {
      return NextResponse.json({ error: "Нет объектов с названием" }, { status: 400 });
    }

    const created = await prisma.$transaction(
      prepared.map((row) =>
        prisma.item.create({
          data: {
            name: row.name,
            locationId,
            quantity: row.quantity,
            unit: row.unit,
            userId,
          },
          select: {
            id: true,
            name: true,
            quantity: true,
            unit: true,
          },
        })
      )
    );

    return NextResponse.json({ count: created.length, items: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка создания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
