export function parseCustomFieldValue(value: FormDataEntryValue | null | undefined): string | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 500);
}
