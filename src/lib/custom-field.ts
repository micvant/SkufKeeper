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
