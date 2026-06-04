"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  MapPin,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatItemQuantity, parseItemUnit, shouldShowItemQuantity } from "@/lib/item-units";
import type { LocationTreeNode } from "@/types";

interface LocationTreeProps {
  nodes: LocationTreeNode[];
  expanded: Set<string>;
  onToggle: (id: string) => void;
  depth?: number;
}

const MAX_TREE_DEPTH_INDENT = 5;

export function LocationTreeView({
  nodes,
  expanded,
  onToggle,
  depth = 0,
}: LocationTreeProps) {
  if (nodes.length === 0) {
    return <p className="text-sm text-slate-500">Нет мест хранения</p>;
  }

  return (
    <ul
      className={cn(
        "min-w-0 max-w-full",
        depth > 0 && depth <= MAX_TREE_DEPTH_INDENT && "ml-2 border-l border-slate-200 pl-2"
      )}
    >
      {nodes.map((node) => (
        <TreeLocationNode
          key={node.id}
          node={node}
          expanded={expanded}
          onToggle={onToggle}
          depth={depth}
        />
      ))}
    </ul>
  );
}

function TreeLocationNode({
  node,
  expanded,
  onToggle,
  depth,
}: {
  node: LocationTreeNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}) {
  const hasContent = node.children.length > 0 || node.items.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <li className="min-w-0 py-0.5">
      <div className="flex min-w-0 items-start gap-1 rounded-xl hover:bg-slate-50">
        <button
          type="button"
          onClick={() => hasContent && onToggle(node.id)}
          className={cn(
            "mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400",
            hasContent ? "hover:bg-slate-200 hover:text-slate-700" : "invisible"
          )}
          aria-label={isExpanded ? "Свернуть" : "Развернуть"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <Link
          href={`/locations/${node.id}`}
          className="group min-w-0 flex-1 overflow-hidden px-1 py-2"
        >
          <div className="flex min-w-0 items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <span className="block truncate font-medium text-slate-900 group-hover:text-primary">
                {node.name}
              </span>
              <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-500">
                {node.directItems > 0 && (
                  <span className="inline-flex max-w-full items-center gap-1">
                    <Package className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {node.directItems} здесь
                      {node.directQuantitySummary && ` — ${node.directQuantitySummary}`}
                    </span>
                  </span>
                )}
                {node.totalItems > node.directItems && (
                  <span className="truncate text-primary">
                    {node.totalItems} всего
                    {node.totalQuantitySummary && ` — ${node.totalQuantitySummary}`}
                  </span>
                )}
                {node.childLocations > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <FolderOpen className="h-3 w-3 shrink-0" />
                    {node.childLocations} влож.
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {isExpanded && hasContent && (
        <div className="min-w-0 pl-7">
          {node.items.length > 0 && (
            <ul className="min-w-0 border-l border-slate-100 pl-2">
              {node.items.map((item) => (
                <li key={item.id} className="min-w-0">
                  <Link
                    href={`/items/${item.id}`}
                    className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-primary-light hover:text-primary-foreground"
                  >
                    <Package className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    {shouldShowItemQuantity(item.quantity, parseItemUnit(item.unit)) && (
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatItemQuantity(item.quantity, parseItemUnit(item.unit))}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {node.children.length > 0 && (
            <LocationTreeView
              nodes={node.children}
              expanded={expanded}
              onToggle={onToggle}
              depth={depth + 1}
            />
          )}
        </div>
      )}
    </li>
  );
}
