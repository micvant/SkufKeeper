import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import { parseCustomFieldValue } from "@/lib/custom-field";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  try {
    const body = (await request.json()) as { value?: string };
    const value = parseCustomFieldValue(body.value);
    if (!value) {
      return NextResponse.json({ error: "Введите значение" }, { status: 400 });
    }

    const existing = await prisma.customFieldValue.findFirst({
      where: {
        id,
        definition: { userId },
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Значение не найдено" }, { status: 404 });
    }

    const fieldValue = await prisma.customFieldValue.update({
      where: { id: existing.id },
      data: { value },
      select: {
        id: true,
        definitionId: true,
        value: true,
        definition: { select: { label: true } },
      },
    });

    return NextResponse.json({
      id: fieldValue.id,
      definitionId: fieldValue.definitionId,
      label: fieldValue.definition.label,
      value: fieldValue.value,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка обновления";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(_request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.customFieldValue.findFirst({
    where: {
      id,
      definition: { userId },
    },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Значение не найдено" }, { status: 404 });
  }

  await prisma.customFieldValue.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}
