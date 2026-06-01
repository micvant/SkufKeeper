import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { collectDescendantIds } from "@/lib/location-tree";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/upload";
import { parseIconField } from "@/lib/icon-field";
import { parseColorField } from "@/lib/color-field";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const location = await prisma.storageLocation.findUnique({
    where: { id },
    include: {
      items: { orderBy: { updatedAt: "desc" } },
      children: {
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
  const { id } = await params;

  try {
    const existing = await prisma.storageLocation.findUnique({ where: { id } });
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

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    let photoPath = existing.photoPath;
    let iconName = iconNameInput ?? existing.iconName;
    let color = colorInput ?? existing.color;

    if (removePhoto && photoPath) {
      await deleteUploadedFile(photoPath);
      photoPath = null;
    }

    if (photo && photo.size > 0) {
      if (photoPath) await deleteUploadedFile(photoPath);
      photoPath = await saveUploadedFile(photo);
      iconName = null;
    } else if (!photoPath && formData.has("iconName")) {
      iconName = iconNameInput;
    }

    if (!photoPath && formData.has("color")) {
      color = colorInput;
    }

    const location = await prisma.storageLocation.update({
      where: { id },
      data: { name, description, photoPath, iconName, color },
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
  const { id } = await params;

  const location = await prisma.storageLocation.findUnique({ where: { id } });
  if (!location) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  const getChildren = async (parentId: string) =>
    prisma.storageLocation.findMany({ where: { parentId }, select: { id: true } });

  const ids = await collectDescendantIds(getChildren, id);

  const allLocations = await prisma.storageLocation.findMany({
    where: { id: { in: ids } },
    include: { items: true },
  });

  for (const loc of allLocations) {
    await deleteUploadedFile(loc.photoPath);
    for (const item of loc.items) {
      await deleteUploadedFile(item.photoPath);
    }
  }

  await prisma.storageLocation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
