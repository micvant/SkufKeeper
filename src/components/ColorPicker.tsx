"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LOCATION_COLOR,
  LOCATION_COLOR_SLUGS,
  LOCATION_COLORS,
  type LocationColorSlug,
} from "@/lib/colors";

interface ColorPickerProps {
  value: LocationColorSlug | null;
  onChange: (color: LocationColorSlug | null) => void;
  label?: string;
}

export function ColorPicker({
  value,
  onChange,
  label = "Цвет места",
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ?? DEFAULT_LOCATION_COLOR;
  const selectedStyle = LOCATION_COLORS[selected];

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

  function pick(slug: LocationColorSlug) {
    onChange(slug === DEFAULT_LOCATION_COLOR && value === null ? null : slug);
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
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-2 ring-inset",
            selectedStyle.swatch,
            selectedStyle.ring
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Выбрать цвет</p>
          <p className="text-xs text-slate-500">{selectedStyle.label}</p>
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
          <div className="relative w-full max-w-lg rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Цвет места</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {LOCATION_COLOR_SLUGS.map((slug) => {
                const style = LOCATION_COLORS[slug];
                const isSelected = selected === slug;

                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => pick(slug)}
                    className="flex flex-col items-center gap-1.5"
                    title={style.label}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-full ring-2 ring-offset-2 transition-all",
                        style.swatch,
                        isSelected ? style.ring : "ring-transparent"
                      )}
                    >
                      {isSelected && <Check className="h-5 w-5 text-white" />}
                    </div>
                    <span className="max-w-full truncate text-[10px] text-slate-500">
                      {style.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
