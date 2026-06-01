import type { LocationTreeNode, StatsResponse } from "@/types";

type LocationRow = {
  id: string;
  name: string;
  parentId: string | null;
  items: { quantity: number }[];
  _count: { children: number };
};

export function buildLocationTree(locations: LocationRow[]): StatsResponse {
  const nodes = new Map<string, LocationTreeNode>();

  for (const loc of locations) {
    const directItemQuantity = loc.items.reduce((sum, item) => sum + item.quantity, 0);
    nodes.set(loc.id, {
      id: loc.id,
      name: loc.name,
      parentId: loc.parentId,
      directItems: loc.items.length,
      directItemQuantity,
      childLocations: loc._count.children,
      totalItems: loc.items.length,
      totalItemQuantity: directItemQuantity,
      children: [],
    });
  }

  const roots: LocationTreeNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    } else if (!node.parentId) {
      roots.push(node);
    }
  }

  function aggregate(node: LocationTreeNode): void {
    for (const child of node.children) {
      aggregate(child);
      node.totalItems += child.totalItems;
      node.totalItemQuantity += child.totalItemQuantity;
    }
  }

  for (const root of roots) aggregate(root);

  sortTree(roots);

  const totalItems = locations.reduce((sum, loc) => sum + loc.items.length, 0);
  const totalItemQuantity = locations.reduce(
    (sum, loc) => sum + loc.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  return {
    totalLocations: locations.length,
    totalItems,
    totalItemQuantity,
    rootLocations: roots.length,
    tree: roots,
  };
}

function sortTree(nodes: LocationTreeNode[]): void {
  nodes.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  for (const node of nodes) sortTree(node.children);
}

export async function collectDescendantIds(
  getChildren: (id: string) => Promise<{ id: string }[]>,
  rootId: string
): Promise<string[]> {
  const ids: string[] = [rootId];
  const children = await getChildren(rootId);
  for (const child of children) {
    ids.push(...(await collectDescendantIds(getChildren, child.id)));
  }
  return ids;
}
