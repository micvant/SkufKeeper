import { prisma } from "@/lib/prisma";
import { customFieldsInclude, serializeEntityWithCustomFields } from "@/lib/custom-field";
import { isExpiringSoon, isLowStock } from "@/lib/item-stock";

export async function getFavoriteLocations(userId: string) {
  const favorites = await prisma.locationFavorite.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      location: {
        include: { _count: { select: { items: true, children: true } } },
      },
    },
  });
  return favorites.map((f) => f.location);
}

export async function getStockAlerts(userId: string, expiringDays = 30) {
  const items = await prisma.item.findMany({
    where: { userId },
    include: {
      location: { select: { id: true, name: true } },
      ...customFieldsInclude,
    },
    orderBy: { name: "asc" },
  });

  const serialized = items.map((i) => serializeEntityWithCustomFields(i));
  return {
    lowStock: serialized.filter((i) => isLowStock(i)),
    expiringSoon: serialized.filter((i) => isExpiringSoon(i, expiringDays)),
  };
}

export async function isLocationFavorite(userId: string, locationId: string) {
  const row = await prisma.locationFavorite.findUnique({
    where: { userId_locationId: { userId, locationId } },
  });
  return Boolean(row);
}
