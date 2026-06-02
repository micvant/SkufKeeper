import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

async function uniqueQrToken(tx: Tx): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const qrToken = randomBytes(8).toString("hex");
    const existing = await tx.storageLocation.findUnique({
      where: { qrToken },
      select: { id: true },
    });
    if (!existing) return qrToken;
  }
  throw new Error("Не удалось сгенерировать уникальный QR-код");
}

/** Demo hierarchy: house → rooms → box → items */
export async function seedDemoStorageForUser(tx: Tx, userId: string) {
  const root = await tx.storageLocation.create({
    data: {
      userId,
      qrToken: await uniqueQrToken(tx),
      name: "Дом (пример)",
      description:
        "Пример структуры: дом → комнаты → ящики → вещи. Можно удалить или изменить под себя.",
      iconName: "home",
      color: "emerald",
    },
  });

  const kitchen = await tx.storageLocation.create({
    data: {
      userId,
      parentId: root.id,
      qrToken: await uniqueQrToken(tx),
      name: "Кухня",
      description: "Комната внутри дома",
      iconName: "coffee",
      color: "amber",
    },
  });

  await tx.item.create({
    data: {
      userId,
      locationId: kitchen.id,
      name: "Кофеварка",
      description: "Пример объекта в комнате",
      iconName: "coffee",
      quantity: 1,
    },
  });

  const garage = await tx.storageLocation.create({
    data: {
      userId,
      parentId: root.id,
      qrToken: await uniqueQrToken(tx),
      name: "Гараж",
      description: "Ещё одна комната на том же уровне",
      iconName: "car",
      color: "slate",
    },
  });

  const toolbox = await tx.storageLocation.create({
    data: {
      userId,
      parentId: garage.id,
      qrToken: await uniqueQrToken(tx),
      name: "Ящик с инструментами",
      description: "Вложенное место внутри гаража",
      iconName: "box",
      color: "orange",
    },
  });

  await tx.item.createMany({
    data: [
      {
        userId,
        locationId: toolbox.id,
        name: "Молоток",
        description: "Пример объекта во вложенном ящике",
        iconName: "hammer",
        quantity: 1,
      },
      {
        userId,
        locationId: toolbox.id,
        name: "Отвёртка",
        iconName: "wrench",
        quantity: 2,
      },
    ],
  });
}
