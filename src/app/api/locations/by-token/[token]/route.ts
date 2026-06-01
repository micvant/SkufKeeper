import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;

  const location = await prisma.storageLocation.findUnique({
    where: { qrToken: token },
    select: { id: true, name: true, qrToken: true },
  });

  if (!location) {
    return NextResponse.json({ error: "Место не найдено" }, { status: 404 });
  }

  return NextResponse.json(location);
}
