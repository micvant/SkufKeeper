import { prisma } from "@/lib/prisma";
import { customFieldsInclude } from "@/lib/custom-field";
import { generateUniqueQrToken } from "@/lib/qr-token";

export async function duplicateItem(userId: string, itemId: string) {
  const source = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: customFieldsInclude,
  });
  if (!source) return null;

  const copy = await prisma.item.create({
    data: {
      userId,
      name: `${source.name} (копия)`,
      description: source.description,
      quantity: source.quantity,
      unit: source.unit,
      minQuantity: source.minQuantity,
      expiresAt: source.expiresAt,
      locationId: source.locationId,
      photoPath: null,
      iconName: source.iconName,
    },
    include: { location: { select: { id: true, name: true } } },
  });

  for (const field of source.customFields ?? []) {
    await prisma.customFieldValue.create({
      data: {
        definitionId: field.definitionId,
        itemId: copy.id,
        value: field.value,
      },
    });
  }

  return copy;
}

export async function duplicateLocation(userId: string, locationId: string) {
  const source = await prisma.storageLocation.findFirst({
    where: { id: locationId, userId },
    include: customFieldsInclude,
  });
  if (!source) return null;

  const qrToken = await generateUniqueQrToken();
  const copy = await prisma.storageLocation.create({
    data: {
      userId,
      name: `${source.name} (копия)`,
      description: source.description,
      parentId: source.parentId,
      iconName: source.iconName,
      color: source.color,
      photoPath: null,
      qrToken,
    },
  });

  for (const field of source.customFields ?? []) {
    await prisma.customFieldValue.create({
      data: {
        definitionId: field.definitionId,
        locationId: copy.id,
        value: field.value,
      },
    });
  }

  return copy;
}
