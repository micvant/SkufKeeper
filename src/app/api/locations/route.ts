import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueQrToken } from "@/lib/qr-token";
import { saveUploadedFile } from "@/lib/upload";

export async function GET() {
  const locations = await prisma.storageLocation.findMany({
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(locations);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const photo = formData.get("photo") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    let photoPath: string | null = null;
    if (photo && photo.size > 0) {
      photoPath = await saveUploadedFile(photo);
    }

    const qrToken = await generateUniqueQrToken();

    const location = await prisma.storageLocation.create({
      data: { name, description, photoPath, qrToken },
      include: { _count: { select: { items: true } } },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка создания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
