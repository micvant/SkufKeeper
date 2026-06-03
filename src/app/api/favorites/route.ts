import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const favorites = await prisma.locationFavorite.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      location: {
        include: { _count: { select: { items: true, children: true } } },
      },
    },
  });

  return NextResponse.json(
    favorites.map((f) => ({
      id: f.id,
      locationId: f.locationId,
      location: f.location,
    }))
  );
}

export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const body = await request.json();
  const locationId = String(body.locationId ?? "").trim();
  if (!locationId) {
    return NextResponse.json({ error: "Укажите место" }, { status: 400 });
  }

  const location = await prisma.storageLocation.findFirst({
    where: { id: locationId, userId },
  });
  if (!location) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  const count = await prisma.locationFavorite.count({ where: { userId } });
  const favorite = await prisma.locationFavorite.upsert({
    where: { userId_locationId: { userId, locationId } },
    create: { userId, locationId, sortOrder: count },
    update: {},
    include: {
      location: { include: { _count: { select: { items: true, children: true } } } },
    },
  });

  return NextResponse.json(favorite, { status: 201 });
}
