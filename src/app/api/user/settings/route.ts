import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/auth";
import { isValidAppTheme, parseAppTheme } from "@/lib/app-theme";

function serializeUserSettings(user: { appTheme: string }) {
  return {
    appTheme: parseAppTheme(user.appTheme),
  };
}

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { appTheme: true },
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
    const body = (await request.json()) as { appTheme?: string };

    if (!body.appTheme || !isValidAppTheme(body.appTheme)) {
      return NextResponse.json({ error: "Некорректная тема" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { appTheme: body.appTheme },
      select: { appTheme: true },
    });

    return NextResponse.json(serializeUserSettings(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка сохранения";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
