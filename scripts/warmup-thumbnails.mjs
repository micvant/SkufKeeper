import { access, readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const THUMB_WIDTH = 128;
const DETAIL_WIDTH = 800;
const WIDTHS = [THUMB_WIDTH, DETAIL_WIDTH];
const ORIGINAL_RE = /^[\da-f-]+(?:\.(?:jpe?g|png|webp|gif|heic|heif))$/i;

function getUploadDir() {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  return path.join(process.cwd(), "public", "uploads");
}

function getCachePath(uploadDir, filename, width) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  return path.join(uploadDir, `${base}.w${width}.webp`);
}

async function exists(filepath) {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function ensureThumbnail(uploadDir, filename, width) {
  const cachePath = getCachePath(uploadDir, filename, width);
  if (await exists(cachePath)) return false;

  const originalPath = path.join(uploadDir, filename);
  const original = await readFile(originalPath);
  const resized = await sharp(original)
    .rotate()
    .resize(width, width, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  await writeFile(cachePath, resized);
  return true;
}

async function main() {
  const uploadDir = getUploadDir();

  try {
    await access(uploadDir);
  } catch {
    console.log("warmup-thumbnails: upload dir missing, skip");
    return;
  }

  const entries = await readdir(uploadDir);
  const originals = entries.filter((entry) => ORIGINAL_RE.test(entry));
  let created = 0;

  for (const filename of originals) {
    for (const width of WIDTHS) {
      try {
        if (await ensureThumbnail(uploadDir, filename, width)) created += 1;
      } catch (error) {
        console.warn(`warmup-thumbnails: skip ${filename} w=${width}:`, error);
      }
    }
  }

  console.log(`warmup-thumbnails: ${created} thumbnails ready in ${uploadDir}`);
}

main().catch((error) => {
  console.error("warmup-thumbnails failed:", error);
  process.exitCode = 1;
});
