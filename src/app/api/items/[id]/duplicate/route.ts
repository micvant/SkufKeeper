import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth";
import { duplicateItem } from "@/lib/duplicate-entity";
import { customFieldsInclude, serializeEntityWithCustomFields } from "@/lib/custom-field";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;
  const copy = await duplicateItem(userId, id);
  if (!copy) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  const full = await prisma.item.findFirst({
    where: { id: copy.id, userId },
    include: {
      location: { select: { id: true, name: true } },
      ...customFieldsInclude,
    },
  });

  return NextResponse.json(serializeEntityWithCustomFields(full!), { status: 201 });
}
