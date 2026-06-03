export const ITEM_UNITS = {
  pcs: { label: "Штуки", short: "шт.", step: 1, decimals: 0 },
  kg: { label: "Килограммы", short: "кг", step: 0.001, decimals: 3 },
  l: { label: "Литры", short: "л", step: 0.001, decimals: 3 },
  ml: { label: "Миллилитры", short: "мл", step: 0.001, decimals: 3 },
  mg: { label: "Миллиграммы", short: "мг", step: 0.001, decimals: 3 },
} as const;

export type ItemUnit = keyof typeof ITEM_UNITS;

export const ITEM_UNIT_IDS = Object.keys(ITEM_UNITS) as ItemUnit[];

export const DEFAULT_ITEM_UNIT: ItemUnit = "pcs";

export function isValidItemUnit(value: string): value is ItemUnit {
  return value in ITEM_UNITS;
}

export function parseItemUnit(value: string | null | undefined): ItemUnit {
  if (value && isValidItemUnit(value)) return value;
  return DEFAULT_ITEM_UNIT;
}

export function sanitizeQuantityInput(raw: string): string {
  let value = raw.replace(/[^\d.,]/g, "");
  const separatorIndex = value.search(/[.,]/);
  if (separatorIndex >= 0) {
    value =
      value.slice(0, separatorIndex + 1) + value.slice(separatorIndex + 1).replace(/[.,]/g, "");
  }
  return value;
}

export function parseItemQuantity(value: FormDataEntryValue | null | undefined): number {
  const parsed = parseFloat(String(value ?? "1").trim().replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return parsed;
}

export function parseItemQuantityStrict(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseFloat(trimmed.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function formatItemQuantity(quantity: number, unit: ItemUnit = DEFAULT_ITEM_UNIT): string {
  const config = ITEM_UNITS[unit];
  const formatted = quantity.toLocaleString("ru-RU", {
    maximumFractionDigits: config.decimals,
    minimumFractionDigits: 0,
  });
  return `${formatted} ${config.short}`;
}

export function shouldShowItemQuantity(quantity: number, unit: ItemUnit = DEFAULT_ITEM_UNIT): boolean {
  if (unit !== DEFAULT_ITEM_UNIT) return true;
  return quantity > 1;
}

export function sumPieceQuantities(items: { quantity: number; unit?: string | null }[]): number {
  return items.reduce(
    (sum, item) => sum + (parseItemUnit(item.unit) === DEFAULT_ITEM_UNIT ? item.quantity : 0),
    0
  );
}
