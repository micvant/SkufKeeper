import {
  enqueueOperation,
  isTempItemId,
  readQueue,
  removeFromQueue,
  type QueuedOperation,
} from "@/lib/offline-queue";

export function isNetworkOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

async function executeOperation(op: QueuedOperation): Promise<void> {
  switch (op.type) {
    case "item.create": {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Ошибка создания");
      }
      const created = await res.json();
      window.dispatchEvent(
        new CustomEvent("skufkeeper-item-synced", {
          detail: { tempId: op.tempId, item: created },
        })
      );
      break;
    }
    case "item.update": {
      if (isTempItemId(op.itemId)) return;
      const res = await fetch(`/api/items/${op.itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op.payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Ошибка обновления");
      }
      break;
    }
    case "item.move": {
      if (isTempItemId(op.itemId)) return;
      const res = await fetch(`/api/items/${op.itemId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: op.locationId, comment: op.comment }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Ошибка перемещения");
      }
      break;
    }
    case "item.delete": {
      if (isTempItemId(op.itemId)) return;
      const res = await fetch(`/api/items/${op.itemId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Ошибка удаления");
      }
      break;
    }
  }
}

export async function flushOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (!isNetworkOnline()) return { synced: 0, failed: 0 };

  const queue = readQueue();
  let synced = 0;
  let failed = 0;

  for (const op of queue) {
    try {
      await executeOperation(op);
      removeFromQueue(op.queueId);
      synced += 1;
    } catch {
      failed += 1;
      break;
    }
  }

  if (synced > 0) {
    window.dispatchEvent(new CustomEvent("skufkeeper-sync-complete", { detail: { synced } }));
  }

  return { synced, failed };
}

export type OfflineMutateResult<T> =
  | { offline: false; response: Response; data: T }
  | { offline: true; queued: true; data: T };

export async function offlineJsonMutate<T>(
  url: string,
  options: RequestInit & { offlineFallback: T; queueIfOffline?: () => void }
): Promise<OfflineMutateResult<T>> {
  if (isNetworkOnline()) {
    const response = await fetch(url, options);
    const data = (await response.json().catch(() => options.offlineFallback)) as T;
    return { offline: false, response, data };
  }

  options.queueIfOffline?.();
  return { offline: true, queued: true, data: options.offlineFallback };
}
