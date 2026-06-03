import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import { isExpiringSoon, isLowStock } from "@/lib/item-stock";
import { customFieldsInclude, serializeEntityWithCustomFields } from "@/lib/custom-field";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const expiringDays = Number(request.nextUrl.searchParams.get("expiringDays") || 30);

  const items = await prisma.item.findMany({
    where: { userId },
    include: {
      location: { select: { id: true, name: true } },
      ...customFieldsInclude,
    },
    orderBy: { name: "asc" },
  });

  const serialized = items.map((i) => serializeEntityWithCustomFields(i));
  const lowStock = serialized.filter((i) => isLowStock(i));
  const expiringSoon = serialized.filter((i) => isExpiringSoon(i, expiringDays));

  return NextResponse.json({ lowStock, expiringSoon });
}
