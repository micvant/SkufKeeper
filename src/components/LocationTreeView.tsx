"use client";

import Link from "next/link";
import { ChevronRight, FolderOpen, MapPin, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocationTreeNode } from "@/types";

interface LocationTreeProps {
  nodes: LocationTreeNode[];
  depth?: number;
}

export function LocationTreeView({ nodes, depth = 0 }: LocationTreeProps) {
  if (nodes.length === 0) {
    return (
      <p className="text-sm text-slate-500">Нет мест хранения</p>
    );
  }

  return (
    <ul className={cn(depth > 0 && "ml-4 border-l border-slate-200 pl-3")}>
      {nodes.map((node) => (
        <li key={node.id} className="py-1.5">
          <Link
            href={`/locations/${node.id}`}
            className="group flex items-start gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-emerald-50"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-900 group-hover:text-emerald-700">
                  {node.name}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {node.totalItems} {node.totalItems === 1 ? "объект" : "объектов"}
                  {node.totalItemQuantity !== node.totalItems && ` (×${node.totalItemQuantity})`}
                </span>
                {node.childLocations > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <FolderOpen className="h-3 w-3" />
                    {node.childLocations} вложен.
                  </span>
                )}
              </div>
            </div>
          </Link>
          {node.children.length > 0 && (
            <LocationTreeView nodes={node.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
