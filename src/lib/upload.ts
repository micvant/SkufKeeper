import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i)) {
    throw new Error("Неподдерживаемый формат изображения");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("Файл слишком большой (максимум 10 МБ)");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function deleteUploadedFile(photoPath: string | null | undefined): Promise<void> {
  if (!photoPath || !photoPath.startsWith("/uploads/")) return;

  const { unlink } = await import("fs/promises");
  const filepath = path.join(process.cwd(), "public", photoPath);

  try {
    await unlink(filepath);
  } catch {
    // file may already be deleted
  }
}
