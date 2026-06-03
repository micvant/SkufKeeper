import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import {
  definitionSelect,
  mapDefinitionDto,
  parseCustomFieldLabel,
  parseCustomFieldOptions,
  parseOptionsFromDb,
  serializeOptionsToDb,
} from "@/lib/custom-field";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await prisma.customFieldDefinition.findFirst({
      where: { id, userId },
      select: { id: true, fieldType: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Поле не найдено" }, { status: 404 });
    }

    const body = (await request.json()) as { label?: string; options?: unknown };
    const data: { label?: string; options?: string | null } = {};

    if (body.label !== undefined) {
      const label = parseCustomFieldLabel(body.label);
      if (!label) {
        return NextResponse.json({ error: "Введите название поля" }, { status: 400 });
      }
      data.label = label;
    }

    if (body.options !== undefined) {
      if (existing.fieldType !== "enum") {
        return NextResponse.json({ error: "Варианты только для перечисления" }, { status: 400 });
      }
      const options = parseCustomFieldOptions(body.options);
      if (options.length === 0) {
        return NextResponse.json({ error: "Добавьте хотя бы один вариант" }, { status: 400 });
      }
      data.options = serializeOptionsToDb(options);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нечего обновлять" }, { status: 400 });
    }

    const definition = await prisma.customFieldDefinition.update({
      where: { id: existing.id },
      data,
      select: definitionSelect,
    });

    return NextResponse.json(mapDefinitionDto(definition));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка обновления";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Такое поле уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
