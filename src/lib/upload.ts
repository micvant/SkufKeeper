import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function getUploadDir(): string {
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }
  return path.join(process.cwd(), "public", "uploads");
}

export function resolveUploadFilename(photoPath: string): string | null {
  if (!photoPath.startsWith("/uploads/")) return null;
  const filename = path.basename(photoPath);
  if (!/^[\da-f-]+\.(jpe?g|png|webp|gif|heic|heif)$/i.test(filename)) return null;
  return filename;
}

export function resolveUploadFilePath(photoPath: string): string | null {
  const filename = resolveUploadFilename(photoPath);
  if (!filename) return null;
  return path.join(getUploadDir(), filename);
}

export async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i)) {
    throw new Error("Неподдерживаемый формат изображения");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("Файл слишком большой (максимум 10 МБ)");
  }

  const uploadDir = getUploadDir();
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function deleteUploadedFile(photoPath: string | null | undefined): Promise<void> {
  const filepath = photoPath ? resolveUploadFilePath(photoPath) : null;
  if (!filepath) return;

  const { unlink } = await import("fs/promises");

  try {
    await unlink(filepath);
  } catch {
    // file may already be deleted
  }
}

export const UPLOAD_MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};
