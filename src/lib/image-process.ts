import { readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getUploadDir, resolveUploadFilename } from "@/lib/upload";

const MAX_UPLOAD_WIDTH = 1600;
const MAX_THUMB_API_WIDTH = 1200;

export async function processUploadedImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(MAX_UPLOAD_WIDTH, MAX_UPLOAD_WIDTH, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

export function getResizedCachePath(filename: string, width: number): string {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  return path.join(getUploadDir(), `${base}.w${width}.webp`);
}

export async function readOrCreateResizedImage(
  filename: string,
  width: number
): Promise<Buffer> {
  const safeWidth = Math.min(Math.max(width, 1), MAX_THUMB_API_WIDTH);
  const originalPath = path.join(getUploadDir(), filename);
  const cachePath = getResizedCachePath(filename, safeWidth);

  try {
    return await readFile(cachePath);
  } catch {
    const original = await readFile(originalPath);
    const resized = await sharp(original)
      .rotate()
      .resize(safeWidth, safeWidth, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    await writeFile(cachePath, resized).catch(() => {});
    return resized;
  }
}

export async function deleteResizedCacheFiles(photoPath: string | null | undefined): Promise<void> {
  const filename = photoPath ? resolveUploadFilename(photoPath) : null;
  if (!filename) return;

  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const uploadDir = getUploadDir();
  const { readdir } = await import("fs/promises");

  try {
    const entries = await readdir(uploadDir);
    await Promise.all(
      entries
        .filter((entry) => entry.startsWith(`${base}.w`) && entry.endsWith(".webp"))
        .map((entry) => unlink(path.join(uploadDir, entry)).catch(() => {}))
    );
  } catch {
    // ignore missing upload dir
  }
}
