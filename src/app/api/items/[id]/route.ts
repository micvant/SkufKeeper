import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/upload";
import { parseIconField } from "@/lib/icon-field";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const item = await prisma.item.findUnique({
    where: { id },
    include: { location: { select: { id: true, name: true } } },
  });

  if (!item) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
    }

    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const locationId = formData.get("locationId") as string;
    const quantity = parseInt(formData.get("quantity") as string) || 1;
    const photo = formData.get("photo") as File | null;
    const removePhoto = formData.get("removePhoto") === "true";
    const iconNameInput = parseIconField(formData.get("iconName"));

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
    } else if (!photoPath && formData.has("iconName")) {
      iconName = iconNameInput;
    }

    const item = await prisma.item.update({
      where: { id },
      data: { name, description, locationId, quantity, photoPath, iconName },
      include: { location: { select: { id: true, name: true } } },
    });

    return NextResponse.json(item);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка обновления";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const item = await prisma.item.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Объект не найден" }, { status: 404 });
  }

  await deleteUploadedFile(item.photoPath);
  await prisma.item.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
