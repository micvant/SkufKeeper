/** Width for list thumbnails (ItemCard, LocationCard). */
export const THUMB_WIDTH = 128;

/** Width for detail page hero images. */
export const DETAIL_WIDTH = 800;

export function getUploadImageUrl(
  photoPath: string | null | undefined,
  width?: number
): string | null {
  if (!photoPath) return null;
  if (!width || width <= 0) return photoPath;
  return `${photoPath}?w=${width}`;
}
