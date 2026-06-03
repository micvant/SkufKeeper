import { parseIconField } from "@/lib/icon-field";
import { parseExpiresAt, parseMinQuantity } from "@/lib/item-stock";
import { parseItemQuantity, parseItemUnit } from "@/lib/item-units";

export type ItemJsonBody = {
  name?: string;
  description?: string | null;
  locationId?: string;
  quantity?: number | string;
  unit?: string;
  minQuantity?: number | string | null;
  expiresAt?: string | null;
  iconName?: string | null;
};

export function parseItemJsonBody(body: ItemJsonBody) {
  const name = String(body.name ?? "").trim();
  const description = body.description?.trim() || null;
  const locationId = String(body.locationId ?? "").trim();
  const quantity = parseItemQuantity(
    body.quantity != null ? String(body.quantity) : "1"
  );
  const unit = parseItemUnit(body.unit ?? null);
  const minQuantity =
    body.minQuantity === null || body.minQuantity === undefined
      ? null
      : parseMinQuantity(String(body.minQuantity));
  const expiresAt = parseExpiresAt(body.expiresAt ?? null);
  const iconName = parseIconField(body.iconName ?? null);

  return { name, description, locationId, quantity, unit, minQuantity, expiresAt, iconName };
}
