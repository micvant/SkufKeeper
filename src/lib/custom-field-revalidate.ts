import { revalidatePath } from "next/cache";

export function revalidateEntityCustomFieldPaths(
  itemId: string | null | undefined,
  locationId: string | null | undefined
): void {
  if (itemId) revalidatePath(`/items/${itemId}`);
  if (locationId) revalidatePath(`/locations/${locationId}`);
}
