import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_LENGTH = 8;
const MAX_ATTEMPTS = 20;

export async function generateUniqueQrToken(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const qrToken = randomBytes(TOKEN_LENGTH).toString("hex");

    const existing = await prisma.storageLocation.findUnique({
      where: { qrToken },
      select: { id: true },
    });

    if (!existing) return qrToken;
  }

  throw new Error("Не удалось сгенерировать уникальный QR-код");
}
