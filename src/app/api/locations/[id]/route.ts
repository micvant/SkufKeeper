import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectDescendantIds } from "@/lib/location-tree";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/upload";
import { parseIconField } from "@/lib/icon-field";
import { parseColorField } from "@/lib/color-field";
import { parseCustomFieldValue } from "@/lib/custom-field";
import { getRequestUserId } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(_request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  const location = await prisma.storageLocation.findFirst({
    where: { id, userId },
    include: {
      items: { where: { userId }, orderBy: { updatedAt: "desc" } },
      children: {
        where: { userId },
        include: { _count: { select: { items: true, children: true } } },
        orderBy: { name: "asc" },
      },
      parent: { select: { id: true, name: true } },
    },
  });

  if (!location) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  return NextResponse.json(location);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  try {
    const existing = await prisma.storageLocation.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
    }

    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const photo = formData.get("photo") as File | null;
    const removePhoto = formData.get("removePhoto") === "true";
    const iconNameInput = parseIconField(formData.get("iconName"));
    const colorInput = parseColorField(formData.get("color"));
    const customFieldValue = parseCustomFieldValue(formData.get("customFieldValue"));

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    let photoPath = existing.photoPath;
    let iconName = existing.iconName;
    let color = existing.color;

    if (removePhoto && photoPath) {
      await deleteUploadedFile(photoPath);
      photoPath = null;
    }

    if (photo && photo.size > 0) {
      if (photoPath) await deleteUploadedFile(photoPath);
      photoPath = await saveUploadedFile(photo);
      iconName = null;
    } else if (!photoPath) {
      if (formData.has("iconName")) iconName = iconNameInput;
      if (formData.has("color")) color = colorInput;
    }

    const location = await prisma.storageLocation.update({
      where: { id: existing.id },
      data: { name, description, photoPath, iconName, color, customFieldValue },
      include: {
        _count: { select: { items: true, children: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка обновления";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(_request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;

  const location = await prisma.storageLocation.findFirst({ where: { id, userId } });
  if (!location) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  const getChildren = async (parentId: string) =>
    prisma.storageLocation.findMany({ where: { parentId, userId }, select: { id: true } });

  const ids = await collectDescendantIds(getChildren, id);

  const allLocations = await prisma.storageLocation.findMany({
    where: { id: { in: ids }, userId },
    include: { items: { where: { userId } } },
  });

  for (const loc of allLocations) {
    await deleteUploadedFile(loc.photoPath);
    for (const item of loc.items) {
      await deleteUploadedFile(item.photoPath);
    }
  }

  await prisma.storageLocation.delete({ where: { id: location.id } });

  return NextResponse.json({ success: true });
}
