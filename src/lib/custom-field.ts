export type CustomFieldEntityType = "item" | "location";

export type CustomFieldType = "text" | "enum";

export const CUSTOM_FIELD_TYPES: { id: CustomFieldType; label: string }[] = [
  { id: "text", label: "Текст" },
  { id: "enum", label: "Перечисление" },
];

export function isCustomFieldEntityType(value: string): value is CustomFieldEntityType {
  return value === "item" || value === "location";
}

export function parseCustomFieldType(value: unknown): CustomFieldType {
  return value === "enum" ? "enum" : "text";
}

export function parseCustomFieldLabel(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 64);
}

export function parseCustomFieldOptions(value: unknown): string[] {
  const rawItems = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,;\n]/)
      : [];

  const seen = new Set<string>();
  const options: string[] = [];

  for (const item of rawItems) {
    const trimmed = String(item).trim().slice(0, 64);
    if (!trimmed) continue;
    const key = trimmed.toLocaleLowerCase("ru-RU");
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(trimmed);
    if (options.length >= 50) break;
  }

  return options;
}

export function parseOptionsFromDb(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    return parseCustomFieldOptions(JSON.parse(value));
  } catch {
    return [];
  }
}

export function serializeOptionsToDb(options: string[]): string | null {
  const normalized = parseCustomFieldOptions(options);
  if (normalized.length === 0) return null;
  return JSON.stringify(normalized);
}

export function parseCustomFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 500);
}

export function isValidEnumFieldValue(value: string, options: string[]): boolean {
  return options.some((option) => option === value);
}

export interface CustomFieldDefinitionDto {
  id: string;
  entityType: CustomFieldEntityType;
  label: string;
  fieldType: CustomFieldType;
  options: string[];
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

export function mapDefinitionDto(definition: {
  id: string;
  entityType: string;
  label: string;
  fieldType: string;
  options: string | null;
}): CustomFieldDefinitionDto {
  return {
    id: definition.id,
    entityType: definition.entityType as CustomFieldEntityType,
    label: definition.label,
    fieldType: parseCustomFieldType(definition.fieldType),
    options: parseOptionsFromDb(definition.options),
  };
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
    include: {
      definition: { select: { label: true, fieldType: true, options: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export const definitionSelect = {
  id: true,
  entityType: true,
  label: true,
  fieldType: true,
  options: true,
} as const;

export { customFieldsInclude };
