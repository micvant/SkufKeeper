import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import { isValidAppTheme, parseAppTheme } from "@/lib/app-theme";
import { isValidColorScheme, parseColorScheme } from "@/lib/color-scheme";

function serializeUserSettings(user: { appTheme: string; appColorScheme: string }) {
  return {
    appTheme: parseAppTheme(user.appTheme),
    appColorScheme: parseColorScheme(user.appColorScheme),
  };
}

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { appTheme: true, appColorScheme: true },
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
    const body = (await request.json()) as { appTheme?: string; appColorScheme?: string };

    const data: { appTheme?: string; appColorScheme?: string } = {};

    if (body.appTheme !== undefined) {
      if (!isValidAppTheme(body.appTheme)) {
        return NextResponse.json({ error: "Некорректная тема" }, { status: 400 });
      }
      data.appTheme = body.appTheme;
    }

    if (body.appColorScheme !== undefined) {
      if (!isValidColorScheme(body.appColorScheme)) {
        return NextResponse.json({ error: "Некорректная схема" }, { status: 400 });
      }
      data.appColorScheme = body.appColorScheme;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Нет данных для обновления" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { appTheme: true, appColorScheme: true },
    });

    return NextResponse.json(serializeUserSettings(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сохранения";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
