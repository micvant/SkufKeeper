import type { Item } from "@/types";
import { enqueueOperation } from "@/lib/offline-queue";
import { cacheJson, locationCacheKey, getCachedJson } from "@/lib/offline-cache";
import type { StorageLocation } from "@/types";

export function buildOptimisticItem(params: {
  tempId: string;
  name: string;
  description?: string | null;
  locationId: string;
  locationName?: string;
  quantity: number;
  unit: string;
  minQuantity?: number | null;
  expiresAt?: string | null;
  iconName?: string | null;
}): Item {
  const now = new Date().toISOString();
  return {
    id: params.tempId,
    name: params.name,
    description: params.description ?? null,
    photoPath: null,
    iconName: params.iconName ?? null,
    quantity: params.quantity,
    unit: params.unit,
    minQuantity: params.minQuantity ?? null,
    expiresAt: params.expiresAt ?? null,
    locationId: params.locationId,
    createdAt: now,
    updatedAt: now,
    location: params.locationName
      ? { id: params.locationId, name: params.locationName }
      : undefined,
    customFields: [],
  };
}

export function appendItemToLocationCache(locationId: string, item: Item) {
  const cached = getCachedJson<StorageLocation>(locationCacheKey(locationId));
  if (!cached) return;
  const items = [...(cached.items ?? []), item];
  cacheJson(locationCacheKey(locationId), { ...cached, items });
}

export function queueCreateItem(
  payload: {
    name: string;
    description?: string | null;
    locationId: string;
    quantity: number;
    unit: string;
    minQuantity?: number | null;
    expiresAt?: string | null;
    iconName?: string | null;
  },
  locationName?: string
) {
  const tempId = `temp_${crypto.randomUUID()}`;
  const op = enqueueOperation({
    type: "item.create",
    tempId,
    payload,
  });
  const optimistic = buildOptimisticItem({
    tempId,
    ...payload,
    locationName,
  });
  appendItemToLocationCache(payload.locationId, optimistic);
  return { tempId, optimistic, op };
}
