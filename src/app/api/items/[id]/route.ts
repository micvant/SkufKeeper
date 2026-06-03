import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/upload";
import { parseIconField } from "@/lib/icon-field";
import { parseItemQuantity, parseItemUnit } from "@/lib/item-units";
import { parseExpiresAt, parseMinQuantity } from "@/lib/item-stock";
import { createItemMoveLog } from "@/lib/item-move-log";
import { customFieldsInclude, serializeEntityWithCustomFields } from "@/lib/custom-field";
import { getRequestUserId } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(_request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: {
      location: { select: { id: true, name: true } },
      ...customFieldsInclude,
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  return NextResponse.json(serializeEntityWithCustomFields(item));
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await prisma.item.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    let name: string;
    let description: string | null;
    let locationId: string;
    let quantity: number;
    let unit: ReturnType<typeof parseItemUnit>;
    let minQuantity: number | null;
    let expiresAt: Date | null;
    let photo: File | null = null;
    let removePhoto = false;
    let iconNameInput: string | null = null;
    let iconFieldProvided = isJson;

    if (isJson) {
      const { parseItemJsonBody } = await import("@/lib/item-api-body");
      const parsed = parseItemJsonBody(await request.json());
      name = parsed.name;
      description = parsed.description;
      locationId = parsed.locationId;
      quantity = parsed.quantity;
      unit = parsed.unit;
      minQuantity = parsed.minQuantity;
      expiresAt = parsed.expiresAt;
      iconNameInput = parsed.iconName;
    } else {
      const formData = await request.formData();
      name = (formData.get("name") as string)?.trim();
      description = (formData.get("description") as string)?.trim() || null;
      locationId = formData.get("locationId") as string;
      quantity = parseItemQuantity(formData.get("quantity"));
      unit = parseItemUnit(formData.get("unit") as string | null);
      minQuantity = parseMinQuantity(formData.get("minQuantity"));
      expiresAt = parseExpiresAt(formData.get("expiresAt"));
      photo = formData.get("photo") as File | null;
      removePhoto = formData.get("removePhoto") === "true";
      iconFieldProvided = formData.has("iconName");
      iconNameInput = parseIconField(formData.get("iconName"));
    }

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    let photoPath = existing.photoPath;
    let iconName = iconNameInput ?? existing.iconName;

    if (removePhoto && photoPath) {
      await deleteUploadedFile(photoPath);
      photoPath = null;
    }

    if (photo && photo.size > 0) {
      if (photoPath) await deleteUploadedFile(photoPath);
      photoPath = await saveUploadedFile(photo);
      iconName = null;
    } else if (!photoPath && iconFieldProvided) {
      iconName = iconNameInput;
    }

    const targetLocation = await prisma.storageLocation.findFirst({
      where: { id: locationId, userId },
      select: { id: true },
    });
    if (!targetLocation) {
      return NextResponse.json({ error: "Место хранения не найдено" }, { status: 404 });
    }

    const item = await prisma.item.update({
      where: { id: existing.id },
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
      },
      include: {
        location: { select: { id: true, name: true } },
        ...customFieldsInclude,
      },
    });

    if (existing.locationId !== locationId) {
      const [fromLoc, toLoc] = await Promise.all([
        prisma.storageLocation.findUnique({
          where: { id: existing.locationId },
          select: { name: true },
        }),
        prisma.storageLocation.findUnique({
          where: { id: locationId },
          select: { name: true },
        }),
      ]);
      await createItemMoveLog({
        userId,
        itemId: existing.id,
        fromLocationId: existing.locationId,
        fromLocationName: fromLoc?.name ?? null,
        toLocationId: locationId,
        toLocationName: toLoc?.name ?? "",
        comment: null,
      });
    }

    return NextResponse.json(serializeEntityWithCustomFields(item));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка обновления";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(_request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  const item = await prisma.item.findFirst({ where: { id, userId } });
  if (!item) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  await deleteUploadedFile(item.photoPath);
  await prisma.item.delete({ where: { id: item.id } });

  return NextResponse.json({ success: true });
}
