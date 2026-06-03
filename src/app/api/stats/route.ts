import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLocationTree } from "@/lib/location-tree";
import { getRequestUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const locations = await prisma.storageLocation.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      parentId: true,
      items: { select: { id: true, name: true, quantity: true, unit: true } },
      _count: { select: { children: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(buildLocationTree(locations));
}
