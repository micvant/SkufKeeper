import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
  hashPassword,
} from "@/lib/auth";
import { seedDemoStorageForUser } from "@/lib/seed-demo-data";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не короче 6 символов" },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email: normalizedEmail, passwordHash },
        select: { id: true, email: true },
      });

      const usersCount = await tx.user.count();
      const isFirstUser = usersCount === 1;

      // Preserve pre-auth data by assigning all unowned records to the first registering user.
      if (isFirstUser) {
        await tx.storageLocation.updateMany({
          where: { userId: null },
          data: { userId: created.id },
        });
        await tx.item.updateMany({
          where: { userId: null },
          data: { userId: created.id },
        });
      }

      const ownedLocations = await tx.storageLocation.count({ where: { userId: created.id } });
      if (!isFirstUser || ownedLocations === 0) {
        await seedDemoStorageForUser(tx, created.id);
      }

      return created;
    });

    const token = await createSessionToken(user.id);
    const response = NextResponse.json(user, { status: 201 });
    response.cookies.set(getSessionCookieName(), token, getSessionCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка регистрации";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
