import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import { parseCustomFieldValue } from "@/lib/custom-field";
import { revalidateEntityCustomFieldPaths } from "@/lib/custom-field-revalidate";

export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      definitionId?: string;
      itemId?: string;
      locationId?: string;
      value?: string;
    };

    const value = parseCustomFieldValue(body.value);
    if (!value) {
      return NextResponse.json({ error: "Введите значение" }, { status: 400 });
    }

    const definitionId = body.definitionId?.trim();
    const itemId = body.itemId?.trim() || null;
    const locationId = body.locationId?.trim() || null;

    if (!definitionId) {
      return NextResponse.json({ error: "Укажите поле" }, { status: 400 });
    }
    if (Boolean(itemId) === Boolean(locationId)) {
      return NextResponse.json({ error: "Укажите itemId или locationId" }, { status: 400 });
    }

    const definition = await prisma.customFieldDefinition.findFirst({
      where: { id: definitionId, userId },
    });
    if (!definition) {
      return NextResponse.json({ error: "Поле не найдено" }, { status: 404 });
    }

    if (itemId) {
      if (definition.entityType !== "item") {
        return NextResponse.json({ error: "Поле не для объектов" }, { status: 400 });
      }
      const item = await prisma.item.findFirst({ where: { id: itemId, userId } });
      if (!item) return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
    }

    if (locationId) {
      if (definition.entityType !== "location") {
        return NextResponse.json({ error: "Поле не для мест хранения" }, { status: 400 });
      }
      const location = await prisma.storageLocation.findFirst({
        where: { id: locationId, userId },
      });
      if (!location) return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
    }

    const fieldValue = await prisma.customFieldValue.upsert({
      where: itemId
        ? { definitionId_itemId: { definitionId, itemId } }
        : { definitionId_locationId: { definitionId, locationId: locationId! } },
      create: { definitionId, itemId, locationId, value },
      update: { value },
      select: {
        id: true,
        definitionId: true,
        value: true,
        definition: { select: { label: true } },
      },
    });

    revalidateEntityCustomFieldPaths(itemId, locationId);

    return NextResponse.json({
      id: fieldValue.id,
      definitionId: fieldValue.definitionId,
      label: fieldValue.definition.label,
      value: fieldValue.value,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сохранения";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
