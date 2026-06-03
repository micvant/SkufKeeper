import type { Item } from "@/types";

export const DEFAULT_EXPIRING_DAYS = 30;

export function parseMinQuantity(value: FormDataEntryValue | null | undefined): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export function parseExpiresAt(value: FormDataEntryValue | null | undefined): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function isLowStock(item: { quantity: number; minQuantity?: number | null }): boolean {
  if (item.minQuantity == null) return false;
  return item.quantity < item.minQuantity;
}

export function isExpiringSoon(
  item: { expiresAt?: string | Date | null },
  withinDays = DEFAULT_EXPIRING_DAYS
): boolean {
  if (!item.expiresAt) return false;
  const expires = new Date(item.expiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  const limit = new Date();
  limit.setDate(limit.getDate() + withinDays);
  return expires <= limit;
}

export function isExpired(item: { expiresAt?: string | Date | null }): boolean {
  if (!item.expiresAt) return false;
  return new Date(item.expiresAt) < new Date();
}

export function formatExpiresAt(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type StockAlertItem = Pick<
  Item,
  "id" | "name" | "quantity" | "unit" | "minQuantity" | "expiresAt" | "locationId"
> & {
  location?: { id: string; name: string };
};
