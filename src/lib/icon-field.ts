import { isValidIconName } from "@/lib/icons";

export function parseIconField(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null") return null;
  return isValidIconName(trimmed) ? trimmed : null;
}
