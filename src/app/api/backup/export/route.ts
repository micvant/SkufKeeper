import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth";
import { exportUserData } from "@/lib/backup";

export async function GET(request: NextRequest) {
  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const data = await exportUserData(userId);
  const stamp = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify(data, null, 2);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="skufkeeper-export-${stamp}.json"`,
    },
  });
}
