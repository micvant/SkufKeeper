import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/upload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const location = await prisma.storageLocation.findUnique({
    where: { id },
    include: {
      items: { orderBy: { updatedAt: "desc" } },
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

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    let photoPath = existing.photoPath;

    if (removePhoto && photoPath) {
      await deleteUploadedFile(photoPath);
      photoPath = null;
    }

    if (photo && photo.size > 0) {
      if (photoPath) await deleteUploadedFile(photoPath);
      photoPath = await saveUploadedFile(photo);
    }

    const location = await prisma.storageLocation.update({
      where: { id },
      data: { name, description, photoPath },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json(location);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка обновления";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const location = await prisma.storageLocation.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  await deleteUploadedFile(location.photoPath);
  for (const item of location.items) {
    await deleteUploadedFile(item.photoPath);
  }

  await prisma.storageLocation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
