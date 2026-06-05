import type { IconName } from "@/lib/icons";
import type { ItemUnit } from "@/lib/item-units";
import type { CustomFieldValueDto } from "@/lib/custom-field";

export type ItemEditFormSnapshot = {
  name: string;
  description: string;
  quantity: string;
  unit: ItemUnit;
  locationId: string;
  minQuantity: string;
  expiresAt: string;
  iconName: IconName | null;
  removePhoto: boolean;
  hasNewPhoto: boolean;
  customFieldsJson: string;
};

export function buildItemEditSnapshot(params: {
  name: string;
  description: string;
  quantity: string;
  unit: ItemUnit;
  locationId: string;
  minQuantity: string;
  expiresAt: string;
  iconName: IconName | null;
  removePhoto: boolean;
  photo: File | null;
  customFields: CustomFieldValueDto[];
}): ItemEditFormSnapshot {
  const sorted = [...params.customFields].sort((a, b) =>
    a.definitionId.localeCompare(b.definitionId)
  );
  return {
    name: params.name.trim(),
    description: params.description.trim(),
    quantity: params.quantity.trim(),
    unit: params.unit,
    locationId: params.locationId,
    minQuantity: params.minQuantity.trim(),
    expiresAt: params.expiresAt.trim(),
    iconName: params.iconName,
    removePhoto: params.removePhoto,
    hasNewPhoto: params.photo != null,
    customFieldsJson: JSON.stringify(
      sorted.map((f) => ({ definitionId: f.definitionId, value: f.value }))
    ),
  };
}

export function isItemEditDirty(
  initial: ItemEditFormSnapshot | null,
  current: ItemEditFormSnapshot
): boolean {
  if (!initial) return false;
  return (
    initial.name !== current.name ||
    initial.description !== current.description ||
    initial.quantity !== current.quantity ||
    initial.unit !== current.unit ||
    initial.locationId !== current.locationId ||
    initial.minQuantity !== current.minQuantity ||
    initial.expiresAt !== current.expiresAt ||
    initial.iconName !== current.iconName ||
    initial.removePhoto !== current.removePhoto ||
    initial.hasNewPhoto !== current.hasNewPhoto ||
    initial.customFieldsJson !== current.customFieldsJson
  );
}
