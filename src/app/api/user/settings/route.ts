import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import { isValidAppTheme, parseAppTheme } from "@/lib/app-theme";

function parseCustomFieldLabel(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 64);
}

function serializeUserSettings(user: {
  appTheme: string;
  itemCustomFieldLabel: string | null;
  locationCustomFieldLabel: string | null;
}) {
  return {
    appTheme: parseAppTheme(user.appTheme),
    itemCustomFieldLabel: user.itemCustomFieldLabel,
    locationCustomFieldLabel: user.locationCustomFieldLabel,
  };
}

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      appTheme: true,
      itemCustomFieldLabel: true,
      locationCustomFieldLabel: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  return NextResponse.json(serializeUserSettings(user));
}

export async function PATCH(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      appTheme?: string;
      itemCustomFieldLabel?: string | null;
      locationCustomFieldLabel?: string | null;
    };

    const data: {
      appTheme?: string;
      itemCustomFieldLabel?: string | null;
      locationCustomFieldLabel?: string | null;
    } = {};

    if (body.appTheme !== undefined) {
      if (!isValidAppTheme(body.appTheme)) {
        return NextResponse.json({ error: "Некорректная тема" }, { status: 400 });
      }
      data.appTheme = body.appTheme;
    }

    if (body.itemCustomFieldLabel !== undefined) {
      data.itemCustomFieldLabel = parseCustomFieldLabel(body.itemCustomFieldLabel);
    }

    if (body.locationCustomFieldLabel !== undefined) {
      data.locationCustomFieldLabel = parseCustomFieldLabel(body.locationCustomFieldLabel);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        appTheme: true,
        itemCustomFieldLabel: true,
        locationCustomFieldLabel: true,
      },
    });

    return NextResponse.json(serializeUserSettings(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сохранения";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
