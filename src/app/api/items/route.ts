import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
import { parseIconField } from "@/lib/icon-field";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Укажите поисковый запрос" }, { status: 400 });
  }

  const items = await prisma.item.findMany({
    where: {
      name: { contains: query },
    },
    include: {
      location: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const locationId = formData.get("locationId") as string;
    const quantity = parseInt(formData.get("quantity") as string) || 1;
    const photo = formData.get("photo") as File | null;
    const iconNameInput = parseIconField(formData.get("iconName"));

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    if (!locationId) {
      return NextResponse.json({ error: "Место хранения обязательно" }, { status: 400 });
    }

    const location = await prisma.storageLocation.findUnique({ where: { id: locationId } });
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
      data: { name, description, locationId, quantity, photoPath, iconName },
      include: { location: { select: { id: true, name: true } } },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка создания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
