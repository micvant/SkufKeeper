import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLocationTree } from "@/lib/location-tree";

export async function GET() {
  const locations = await prisma.storageLocation.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
      items: { select: { id: true, name: true, quantity: true } },
      _count: { select: { children: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(buildLocationTree(locations));
}
