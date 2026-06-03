import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import {
  isCustomFieldEntityType,
  parseCustomFieldLabel,
  type CustomFieldEntityType,
} from "@/lib/custom-field";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const entityType = request.nextUrl.searchParams.get("entityType");
  if (!entityType || !isCustomFieldEntityType(entityType)) {
    return NextResponse.json({ error: "Укажите entityType=item или location" }, { status: 400 });
  }

  const definitions = await prisma.customFieldDefinition.findMany({
    where: { userId, entityType },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: { id: true, entityType: true, label: true },
  });

  return NextResponse.json(definitions);
}

export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  try {
    const body = (await request.json()) as { entityType?: string; label?: string };
    const entityType = body.entityType;
    const label = parseCustomFieldLabel(body.label);

    if (!entityType || !isCustomFieldEntityType(entityType)) {
      return NextResponse.json({ error: "Некорректный тип сущности" }, { status: 400 });
    }
    if (!label) {
      return NextResponse.json({ error: "Введите название поля" }, { status: 400 });
    }

    const count = await prisma.customFieldDefinition.count({
      where: { userId, entityType: entityType as CustomFieldEntityType },
    });

    const definition = await prisma.customFieldDefinition.create({
      data: {
        userId,
        entityType,
        label,
        sortOrder: count,
      },
      select: { id: true, entityType: true, label: true },
    });

    return NextResponse.json(definition, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка создания";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Такое поле уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
