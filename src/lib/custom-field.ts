export type CustomFieldEntityType = "item" | "location";

export function isCustomFieldEntityType(value: string): value is CustomFieldEntityType {
  return value === "item" || value === "location";
}

export function parseCustomFieldLabel(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 64);
}

export function parseCustomFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 500);
}

export interface CustomFieldDefinitionDto {
  id: string;
  entityType: CustomFieldEntityType;
  label: string;
}

export interface CustomFieldValueDto {
  id: string;
  definitionId: string;
  label: string;
  value: string;
}

export interface DraftCustomField {
  localId: string;
  definitionId: string;
  label: string;
  value: string;
}

export async function persistCustomFieldDrafts(
  entityType: CustomFieldEntityType,
  entityId: string,
  drafts: DraftCustomField[]
): Promise<void> {
  for (const draft of drafts) {
    const res = await fetch("/api/custom-fields/values", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        definitionId: draft.definitionId,
        value: draft.value,
        ...(entityType === "item" ? { itemId: entityId } : { locationId: entityId }),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Не удалось сохранить дополнительное поле");
    }
  }
}

export function mapCustomFields(
  fields: Array<{
    id: string;
    definitionId: string;
    value: string;
    definition: { label: string };
  }>
): CustomFieldValueDto[] {
  return fields.map((field) => ({
    id: field.id,
    definitionId: field.definitionId,
    label: field.definition.label,
    value: field.value,
  }));
}

export function serializeEntityWithCustomFields<
  T extends Record<string, unknown> & {
    customFields?: Array<{
      id: string;
      definitionId: string;
      value: string;
      definition: { label: string };
    }>;
  },
>(entity: T) {
  const { customFields, ...rest } = entity;
  return {
    ...rest,
    customFields: customFields ? mapCustomFields(customFields) : [],
  };
}

const customFieldsInclude = {
  customFields: {
    include: { definition: { select: { label: true } } },
    orderBy: { createdAt: "asc" as const },
  },
};

export { customFieldsInclude };
