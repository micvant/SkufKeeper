import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
import { parseIconField } from "@/lib/icon-field";
import { parseItemQuantity, parseItemUnit } from "@/lib/item-units";
import { getRequestUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Укажите поисковый запрос" }, { status: 400 });
  }

  const lowerQuery = query.toLowerCase();
  const all_items = await prisma.item.findMany({
    where: { userId },
    include: {
      location: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
  const items = all_items.filter((i) =>
    i.name.toLowerCase().includes(lowerQuery)
  );

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const locationId = formData.get("locationId") as string;
    const quantity = parseItemQuantity(formData.get("quantity"));
    const unit = parseItemUnit(formData.get("unit") as string | null);
    const photo = formData.get("photo") as File | null;
    const iconNameInput = parseIconField(formData.get("iconName"));

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    if (!locationId) {
      return NextResponse.json({ error: "Место хранения обязательно" }, { status: 400 });
    }

    const location = await prisma.storageLocation.findFirst({ where: { id: locationId, userId } });
    if (!location) {
      return NextResponse.json({ error: "Место хранения не найдено" }, { status: 404 });
    }

    let photoPath: string | null = null;
    let iconName: string | null = iconNameInput;
    if (photo && photo.size > 0) {
      photoPath = await saveUploadedFile(photo);
      iconName = null;
    }

    const item = await prisma.item.create({
      data: { name, description, locationId, quantity, unit, photoPath, iconName, userId },
      include: { location: { select: { id: true, name: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка создания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
