import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth";
import { duplicateLocation } from "@/lib/duplicate-entity";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const userId = await getRequestUserId(_request);
  if (!userId) return NextResponse.json({ error: "Требуется вход" }, { status: 401 });

  const { id } = await params;
  const copy = await duplicateLocation(userId, id);
  if (!copy) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  return NextResponse.json(copy, { status: 201 });
}
