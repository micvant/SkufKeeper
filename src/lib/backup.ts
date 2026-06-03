import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const BACKUP_RETENTION = 7;

export function getDataDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (dbUrl.startsWith("file:")) {
    const filePath = dbUrl.replace(/^file:/, "");
    return path.dirname(filePath);
  }
  return path.join(process.cwd(), ".data");
}

export function getBackupsDir(): string {
  return path.join(getDataDir(), "backups");
}

export async function exportUserData(userId: string) {
  const [user, locations, items, definitions, values, favorites, moveLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, appTheme: true, createdAt: true },
    }),
    prisma.storageLocation.findMany({ where: { userId } }),
    prisma.item.findMany({ where: { userId } }),
    prisma.customFieldDefinition.findMany({ where: { userId } }),
    prisma.customFieldValue.findMany({
      where: {
        OR: [{ item: { userId } }, { location: { userId } }],
      },
    }),
    prisma.locationFavorite.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
    prisma.itemMoveLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    user,
    locations,
    items,
    customFieldDefinitions: definitions,
    customFieldValues: values,
    locationFavorites: favorites,
    itemMoveLogs: moveLogs,
  };
}

export async function runDatabaseBackup(): Promise<{ filename: string; size: number } | null> {
  const dataDir = getDataDir();
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (!dbUrl.startsWith("file:")) return null;

  const dbPath = dbUrl.replace(/^file:/, "");
  try {
    await fs.access(dbPath);
  } catch {
    return null;
  }

  const backupsDir = getBackupsDir();
  await fs.mkdir(backupsDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `dev-${stamp}.db`;
  const dest = path.join(backupsDir, filename);
  await fs.copyFile(dbPath, dest);

  const files = (await fs.readdir(backupsDir))
    .filter((f) => f.endsWith(".db"))
    .sort()
    .reverse();

  for (const old of files.slice(BACKUP_RETENTION)) {
    await fs.unlink(path.join(backupsDir, old)).catch(() => undefined);
  }

  const stat = await fs.stat(dest);
  await fs.writeFile(
    path.join(backupsDir, "last-backup.json"),
    JSON.stringify({ filename, at: new Date().toISOString(), size: stat.size })
  );

  return { filename, size: stat.size };
}

export async function getBackupStatus() {
  const backupsDir = getBackupsDir();
  try {
    const raw = await fs.readFile(path.join(backupsDir, "last-backup.json"), "utf8");
    const meta = JSON.parse(raw) as { filename: string; at: string; size: number };
    const files = (await fs.readdir(backupsDir)).filter((f) => f.endsWith(".db"));
    return { ...meta, count: files.length };
  } catch {
    return null;
  }
}
