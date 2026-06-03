import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth";
import { getBackupStatus } from "@/lib/backup";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const status = await getBackupStatus();
  return NextResponse.json({ status });
}
