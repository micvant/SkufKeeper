import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
import { parseIconField } from "@/lib/icon-field";
import { parseItemQuantity, parseItemUnit } from "@/lib/item-units";
import { getRequestUserId } from "@/lib/auth";
import { customFieldsInclude, serializeEntityWithCustomFields } from "@/lib/custom-field";
import { isExpiringSoon, isLowStock, parseExpiresAt, parseMinQuantity } from "@/lib/item-stock";
import { matchesQuery } from "@/lib/item-search";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const locationId = sp.get("locationId")?.trim() || undefined;
  const unit = sp.get("unit")?.trim() || undefined;
  const lowStock = sp.get("lowStock") === "1" || sp.get("lowStock") === "true";
  const expiringDays = sp.get("expiringDays") ? Number(sp.get("expiringDays")) : 0;

  const hasFilter = Boolean(q || locationId || unit || lowStock || expiringDays > 0);
  if (!hasFilter) {
    return NextResponse.json({ error: "Укажите запрос или фильтр" }, { status: 400 });
  }

  const items = await prisma.item.findMany({
    where: {
      userId,
      ...(locationId ? { locationId } : {}),
      ...(unit ? { unit } : {}),
    },
    include: {
      location: { select: { id: true, name: true } },
      ...customFieldsInclude,
    },
    orderBy: { name: "asc" },
  });

  let result = items.map((i) => serializeEntityWithCustomFields(i));

  if (q) {
    result = result.filter((item) => matchesQuery(item, q));
  }
  if (unit) {
    result = result.filter((item) => parseItemUnit(item.unit) === unit);
  }
  if (lowStock) {
    result = result.filter((item) => isLowStock(item));
  }
  if (expiringDays > 0) {
    result = result.filter((item) => isExpiringSoon(item, expiringDays));
  }

  return NextResponse.json(result);
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
    const minQuantity = parseMinQuantity(formData.get("minQuantity"));
    const expiresAt = parseExpiresAt(formData.get("expiresAt"));
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
      data: {
        name,
        description,
        locationId,
        quantity,
        unit,
        minQuantity,
        expiresAt,
        photoPath,
        iconName,
        userId,
      },
      include: { location: { select: { id: true, name: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка создания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
