#!/usr/bin/env node
/**
 * Periodic SQLite backup. Run in background on production (see start-production.sh).
 * Interval: BACKUP_INTERVAL_MS (default 6 hours).
 */
import fs from "fs/promises";
import path from "path";

const INTERVAL_MS = Number(process.env.BACKUP_INTERVAL_MS) || 6 * 60 * 60 * 1000;
const RETENTION = 7;

function dataDir() {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  const url = process.env.DATABASE_URL ?? "";
  if (url.startsWith("file:")) return path.dirname(url.replace(/^file:/, ""));
  return path.join(process.cwd(), ".data");
}

async function backupOnce() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.startsWith("file:")) {
    console.log("[backup] skip: not a file database");
    return;
  }

  const dbPath = url.replace(/^file:/, "");
  try {
    await fs.access(dbPath);
  } catch {
    console.log("[backup] skip: db not found", dbPath);
    return;
  }

  const dir = path.join(dataDir(), "backups");
  await fs.mkdir(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const name = `dev-${stamp}.db`;
  const dest = path.join(dir, name);
  await fs.copyFile(dbPath, dest);
  const stat = await fs.stat(dest);

  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".db")).sort().reverse();
  for (const old of files.slice(RETENTION)) {
    await fs.unlink(path.join(dir, old)).catch(() => undefined);
  }

  await fs.writeFile(
    path.join(dir, "last-backup.json"),
    JSON.stringify({ filename: name, at: new Date().toISOString(), size: stat.size })
  );

  console.log(`[backup] saved ${name} (${stat.size} bytes)`);
}

async function loop() {
  await backupOnce();
  setInterval(backupOnce, INTERVAL_MS);
}

loop().catch((err) => {
  console.error("[backup] fatal", err);
  process.exit(1);
});
