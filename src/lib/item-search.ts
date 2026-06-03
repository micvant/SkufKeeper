import type { Prisma } from "@prisma/client";
import { isExpiringSoon, isLowStock } from "@/lib/item-stock";
import { parseItemUnit } from "@/lib/item-units";

export type ItemSearchParams = {
  q?: string;
  locationId?: string;
  unit?: string;
  lowStock?: boolean;
  expiringDays?: number;
};

export function buildItemSearchFilter(
  userId: string,
  params: ItemSearchParams
): { where: Prisma.ItemWhereInput; postFilter?: (item: SearchItemRow) => boolean } {
  const where: Prisma.ItemWhereInput = { userId };

  if (params.locationId) {
    where.locationId = params.locationId;
  }

  if (params.unit) {
    where.unit = params.unit;
  }

  const q = params.q?.trim().toLowerCase();
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      {
        customFields: {
          some: { value: { contains: q } },
        },
      },
    ];
  }

  const needsPost =
    params.lowStock === true || (params.expiringDays != null && params.expiringDays > 0);

  if (!needsPost) {
    return { where };
  }

  return {
    where,
    postFilter: (item) => {
      if (params.lowStock && !isLowStock(item)) return false;
      if (params.expiringDays && params.expiringDays > 0) {
        if (!isExpiringSoon(item, params.expiringDays)) return false;
      }
      return true;
    },
  };
}

export type SearchItemRow = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  minQuantity: number | null;
  expiresAt: Date | null;
  locationId: string;
  photoPath: string | null;
  iconName: string | null;
  location: { id: string; name: string };
  customFields?: { label: string; value: string }[];
};

export function matchesQuery(item: SearchItemRow, q: string): boolean {
  const lower = q.toLowerCase();
  if (item.name.toLowerCase().includes(lower)) return true;
  if (item.description?.toLowerCase().includes(lower)) return true;
  if (item.location.name.toLowerCase().includes(lower)) return true;
  if (item.customFields?.some((f) => f.value.toLowerCase().includes(lower))) return true;
  return false;
}

export function filterByUnit(items: SearchItemRow[], unit?: string): SearchItemRow[] {
  if (!unit) return items;
  return items.filter((i) => parseItemUnit(i.unit) === unit);
}
