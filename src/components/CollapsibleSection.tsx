"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: React.ReactNode;
  count?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function CollapsibleSection({
  title,
  count,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  actions,
  children,
  className,
  contentClassName,
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;

  function toggle() {
    const next = !isOpen;
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  return (
    <div className={cn("min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white", className)}>
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={toggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={isOpen}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
          <span className="min-w-0 truncate font-semibold text-slate-900">{title}</span>
          {count !== undefined && (
            <span className="shrink-0 text-sm font-normal text-slate-500">({count})</span>
          )}
        </button>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>

      {isOpen && (
        <div className={cn("min-w-0 overflow-x-hidden border-t border-slate-100 px-3 pb-4 pt-2 sm:px-4", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}
