import type { LocationTreeNode, StatsResponse } from "@/types";
import {
  formatQuantityTotalsSummary,
  mergeQuantityTotals,
  sumQuantitiesByUnit,
} from "@/lib/item-units";

type LocationRow = {
  id: string;
  name: string;
  parentId: string | null;
  items: { id: string; name: string; quantity: number; unit: string }[];
  _count: { children: number };
};

export function buildLocationTree(locations: LocationRow[]): StatsResponse {
  const nodes = new Map<string, LocationTreeNode>();

  for (const loc of locations) {
    const directTotals = sumQuantitiesByUnit(loc.items);
    const sortedItems = [...loc.items].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    nodes.set(loc.id, {
      id: loc.id,
      name: loc.name,
      parentId: loc.parentId,
      directItems: loc.items.length,
      directItemQuantity: directTotals.pcs ?? 0,
      directQuantitySummary: formatQuantityTotalsSummary(directTotals),
      childLocations: loc._count.children,
      totalItems: loc.items.length,
      totalItemQuantity: directTotals.pcs ?? 0,
      totalQuantitySummary: formatQuantityTotalsSummary(directTotals),
      items: sortedItems,
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

  function aggregateNode(node: LocationTreeNode): ReturnType<typeof sumQuantitiesByUnit> {
    let totals = sumQuantitiesByUnit(node.items);
    let totalItems = node.items.length;

    for (const child of node.children) {
      const childTotals = aggregateNode(child);
      totalItems += child.totalItems;
      totals = mergeQuantityTotals(totals, childTotals);
    }

    node.totalItems = totalItems;
    node.totalItemQuantity = totals.pcs ?? 0;
    node.totalQuantitySummary = formatQuantityTotalsSummary(totals);
    return totals;
  }

  for (const root of roots) aggregateNode(root);

  sortTree(roots);

  const allItems = locations.flatMap((loc) => loc.items);
  const globalTotals = sumQuantitiesByUnit(allItems);

  return {
    totalLocations: locations.length,
    totalItems: locations.reduce((sum, loc) => sum + loc.items.length, 0),
    totalItemQuantity: globalTotals.pcs ?? 0,
    totalQuantitySummary: formatQuantityTotalsSummary(globalTotals),
    rootLocations: roots.length,
    tree: roots,
  };
}

function sortTree(nodes: LocationTreeNode[]): void {
  nodes.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  for (const node of nodes) sortTree(node.children);
}

export function collectExpandableIds(nodes: LocationTreeNode[]): Set<string> {
  const ids = new Set<string>();

  function walk(list: LocationTreeNode[]) {
    for (const node of list) {
      if (node.children.length > 0 || node.items.length > 0) {
        ids.add(node.id);
      }
      walk(node.children);
    }
  }

  walk(nodes);
  return ids;
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
