import { prisma } from "@/lib/prisma";

export async function createItemMoveLog(params: {
  userId: string;
  itemId: string;
  fromLocationId: string | null;
  fromLocationName: string | null;
  toLocationId: string;
  toLocationName: string;
  comment?: string | null;
}) {
  return prisma.itemMoveLog.create({
    data: {
      userId: params.userId,
      itemId: params.itemId,
      fromLocationId: params.fromLocationId,
      fromLocationName: params.fromLocationName,
      toLocationId: params.toLocationId,
      toLocationName: params.toLocationName,
      comment: params.comment?.trim() || null,
    },
  });
}
