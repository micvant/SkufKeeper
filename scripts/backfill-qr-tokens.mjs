import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
const MAX_ATTEMPTS = 20;

async function generateUniqueQrToken() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const qrToken = randomBytes(8).toString("hex");
    const existing = await prisma.storageLocation.findUnique({
      where: { qrToken },
      select: { id: true },
    });
    if (!existing) return qrToken;
  }
  throw new Error("Failed to generate unique QR token");
}

async function main() {
  const locations = await prisma.storageLocation.findMany({
    where: { qrToken: null },
    select: { id: true },
  });

  for (const location of locations) {
    await prisma.storageLocation.update({
      where: { id: location.id },
      data: { qrToken: await generateUniqueQrToken() },
    });
  }

  console.log(`Backfilled ${locations.length} location(s)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
