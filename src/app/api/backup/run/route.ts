import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth";
import { runDatabaseBackup } from "@/lib/backup";

export async function POST(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const result = await runDatabaseBackup();
  if (!result) {
    return NextResponse.json(
      { error: "Автобэкап доступен только для файловой базы на сервере" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, ...result });
}
