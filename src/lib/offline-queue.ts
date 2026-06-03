import { safeGetItem, safeSetItem } from "@/lib/safe-storage";

const QUEUE_KEY = "skufkeeper-sync-queue-v1";

export type QueuedOperation =
  | {
      queueId: string;
      type: "item.create";
      tempId: string;
      payload: {
        name: string;
        description?: string | null;
        locationId: string;
        quantity: number;
        unit: string;
        minQuantity?: number | null;
        expiresAt?: string | null;
        iconName?: string | null;
      };
      createdAt: string;
    }
  | {
      queueId: string;
      type: "item.update";
      itemId: string;
      payload: {
        name: string;
        description?: string | null;
        locationId: string;
        quantity: number;
        unit: string;
        minQuantity?: number | null;
        expiresAt?: string | null;
        iconName?: string | null;
      };
      createdAt: string;
    }
  | {
      queueId: string;
      type: "item.move";
      itemId: string;
      locationId: string;
      comment?: string | null;
      createdAt: string;
    }
  | {
      queueId: string;
      type: "item.delete";
      itemId: string;
      createdAt: string;
    };

export function readQueue(): QueuedOperation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeGetItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedOperation[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedOperation[]) {
  safeSetItem(QUEUE_KEY, JSON.stringify(queue));
}

export type QueuedOperationInput =
  | Omit<Extract<QueuedOperation, { type: "item.create" }>, "queueId" | "createdAt">
  | Omit<Extract<QueuedOperation, { type: "item.update" }>, "queueId" | "createdAt">
  | Omit<Extract<QueuedOperation, { type: "item.move" }>, "queueId" | "createdAt">
  | Omit<Extract<QueuedOperation, { type: "item.delete" }>, "queueId" | "createdAt">;

export function enqueueOperation(op: QueuedOperationInput) {
  const queue = readQueue();
  const entry = {
    ...op,
    queueId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  } as QueuedOperation;
  queue.push(entry);
  writeQueue(queue);
  window.dispatchEvent(new CustomEvent("skufkeeper-queue-changed"));
  return entry;
}

export function removeFromQueue(queueId: string) {
  writeQueue(readQueue().filter((op) => op.queueId !== queueId));
  window.dispatchEvent(new CustomEvent("skufkeeper-queue-changed"));
}

export function getQueueCount(): number {
  return readQueue().length;
}

export function isTempItemId(id: string): boolean {
  return id.startsWith("temp_");
}
