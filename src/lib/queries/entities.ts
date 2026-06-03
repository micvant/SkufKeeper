import { prisma } from "@/lib/prisma";
import { customFieldsInclude, serializeEntityWithCustomFields } from "@/lib/custom-field";

export async function getItemById(userId: string, id: string) {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: {
      location: { select: { id: true, name: true } },
      ...customFieldsInclude,
    },
  });

  if (!item) return null;
  return serializeEntityWithCustomFields(item);
}

export async function getLocationById(userId: string, id: string) {
  const location = await prisma.storageLocation.findFirst({
    where: { id, userId },
    include: {
      items: { where: { userId }, orderBy: { updatedAt: "desc" } },
      children: {
        where: { userId },
        include: { _count: { select: { items: true, children: true } } },
        orderBy: { name: "asc" },
      },
      parent: { select: { id: true, name: true } },
      ...customFieldsInclude,
    },
  });

  if (!location) return null;
  return serializeEntityWithCustomFields(location);
}
