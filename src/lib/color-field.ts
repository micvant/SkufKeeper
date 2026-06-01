import { isValidLocationColor } from "@/lib/colors";

export function parseColorField(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null") return null;
  return isValidLocationColor(trimmed) ? trimmed : null;
}
