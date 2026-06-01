"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ITEM_ICON,
  DEFAULT_LOCATION_ICON,
  ENTITY_ICONS,
  ICON_NAMES,
  type IconName,
} from "@/lib/icons";

interface IconPickerProps {
  value: IconName | null;
  onChange: (icon: IconName | null) => void;
  variant?: "location" | "item";
  label?: string;
  /** Tailwind classes for preview button background/text */
  previewBg?: string;
  previewText?: string;
}

export function IconPicker({
  value,
  onChange,
  variant = "item",
  label = "Иконка",
  previewBg = "bg-slate-100",
  previewText = "text-slate-600",
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const defaultIcon = variant === "location" ? DEFAULT_LOCATION_ICON : DEFAULT_ITEM_ICON;
  const selected = value ?? defaultIcon;
  const SelectedIcon = ENTITY_ICONS[selected];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(name: IconName) {
    onChange(name === defaultIcon && value === null ? null : name);
    setOpen(false);
  }

  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:border-emerald-300 hover:bg-slate-50"
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            previewBg
          )}
        >
          <SelectedIcon className={cn("h-5 w-5", previewText)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Выбрать иконку</p>
          <p className="text-xs text-slate-500">{ICON_NAMES.length} вариантов</p>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex max-h-[min(85vh,640px)] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-900">Выбор иконки</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-3">
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                {ICON_NAMES.map((name) => {
                  const Icon = ENTITY_ICONS[name];
                  const isSelected = selected === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => pick(name)}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-xl border-2 transition-colors",
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/50"
                      )}
                      title={name}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
