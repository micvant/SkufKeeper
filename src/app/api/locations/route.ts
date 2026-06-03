import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueQrToken } from "@/lib/qr-token";
import { saveUploadedFile } from "@/lib/upload";
import { parseIconField } from "@/lib/icon-field";
import { parseColorField } from "@/lib/color-field";
import { getRequestUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const parentId = request.nextUrl.searchParams.get("parentId");
  const all = request.nextUrl.searchParams.get("all") === "true";
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (query) {
    const lowerQuery = query.toLowerCase();
    const all_locations = await prisma.storageLocation.findMany({
      where: { userId },
      include: {
        _count: { select: { items: true, children: true } },
        parent: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
    const locations = all_locations
      .filter((l) => l.name.toLowerCase().includes(lowerQuery))
      .slice(0, 30);
    return NextResponse.json(locations);
  }

  const locations = await prisma.storageLocation.findMany({
    where: all ? { userId } : parentId ? { parentId, userId } : { parentId: null, userId },
    include: {
      _count: { select: { items: true, children: true } },
      ...(all ? { parent: { select: { id: true, name: true } } } : {}),
    },
    orderBy: all ? { name: "asc" } : { updatedAt: "desc" },
  });

  return NextResponse.json(locations);
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

    const formData = await request.formData();
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const parentId = (formData.get("parentId") as string)?.trim() || null;
    const photo = formData.get("photo") as File | null;
    const iconNameInput = parseIconField(formData.get("iconName"));
    const colorInput = parseColorField(formData.get("color"));

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    if (parentId) {
      const parent = await prisma.storageLocation.findFirst({ where: { id: parentId, userId } });
      if (!parent) {
        return NextResponse.json({ error: "Родительское место не найдено" }, { status: 404 });
      }
    }

    let photoPath: string | null = null;
    let iconName: string | null = iconNameInput;
    if (photo && photo.size > 0) {
      photoPath = await saveUploadedFile(photo);
      iconName = null;
    }

    const qrToken = await generateUniqueQrToken();

    const location = await prisma.storageLocation.create({
      data: {
        name,
        description,
        photoPath,
        iconName,
        color: colorInput,
        qrToken,
        parentId,
        userId,
      },
      include: {
        _count: { select: { items: true, children: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка создания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
