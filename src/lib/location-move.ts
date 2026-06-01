import { prisma } from "@/lib/prisma";
import { collectDescendantIds } from "@/lib/location-tree";

export async function wouldCreateLocationCycle(
  locationId: string,
  newParentId: string | null
): Promise<boolean> {
  if (!newParentId) return false;
  if (newParentId === locationId) return true;

  const getChildren = async (parentId: string) =>
    prisma.storageLocation.findMany({ where: { parentId }, select: { id: true } });

  const descendants = await collectDescendantIds(getChildren, locationId);
  return descendants.includes(newParentId);
}
