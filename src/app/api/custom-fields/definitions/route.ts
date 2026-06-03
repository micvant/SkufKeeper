import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import {
  definitionSelect,
  isCustomFieldEntityType,
  mapDefinitionDto,
  parseCustomFieldLabel,
  parseCustomFieldOptions,
  parseCustomFieldType,
  serializeOptionsToDb,
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
    select: definitionSelect,
  });

  return NextResponse.json(definitions.map(mapDefinitionDto));
}

export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      entityType?: string;
      label?: string;
      fieldType?: string;
      options?: unknown;
    };
    const entityType = body.entityType;
    const label = parseCustomFieldLabel(body.label);
    const fieldType = parseCustomFieldType(body.fieldType);
    const options = parseCustomFieldOptions(body.options);

    if (!entityType || !isCustomFieldEntityType(entityType)) {
      return NextResponse.json({ error: "Некорректный тип сущности" }, { status: 400 });
    }
    if (!label) {
      return NextResponse.json({ error: "Введите название поля" }, { status: 400 });
    }
    if (fieldType === "enum" && options.length === 0) {
      return NextResponse.json({ error: "Добавьте хотя бы один вариант перечисления" }, { status: 400 });
    }

    const count = await prisma.customFieldDefinition.count({
      where: { userId, entityType: entityType as CustomFieldEntityType },
    });

    const definition = await prisma.customFieldDefinition.create({
      data: {
        userId,
        entityType,
        label,
        fieldType,
        options: fieldType === "enum" ? serializeOptionsToDb(options) : null,
        sortOrder: count,
      },
      select: definitionSelect,
    });

    return NextResponse.json(mapDefinitionDto(definition), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка создания";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Такое поле уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
