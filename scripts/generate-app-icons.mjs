import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source =
  process.argv[2] ||
  path.join(
    process.env.HOME || "",
    ".cursor/projects/home-micvant-PycharmProjects-SkufKeeper/assets/image-4a959e20-b41d-48c7-9754-6a4351d8e53d.png"
  );
const outDir = path.join(root, "public", "icons");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32.png", size: 32 },
  { name: "logo.png", size: 256 },
];

await mkdir(outDir, { recursive: true });

for (const { name, size } of sizes) {
  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background: { r: 248, g: 250, b: 252, alpha: 1 },
    })
    .png()
    .toFile(path.join(outDir, name));
  console.log(`Created ${name} (${size}x${size})`);
}

console.log("Done:", outDir);
