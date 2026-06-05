"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpiresAtFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function ExpiresAtField({
  value,
  onChange,
  label = "Срок годности (необязательно)",
  className,
}: ExpiresAtFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(next: string) {
    onChange(next);
  }

  function handleClear() {
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("min-w-0 max-w-full space-y-1.5", className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <div className="flex w-full min-w-0 items-stretch gap-2">
        <div className="sk-date-field relative min-w-0 flex-1">
          {!value && (
            <span
              className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400 dark:text-slate-500"
              aria-hidden
            >
              Выберите дату
            </span>
          )}
          <input
            ref={inputRef}
            id={inputId}
            type="date"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onInput={(e) => handleChange(e.currentTarget.value)}
            className={cn(
              "sk-date-input w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
              "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
              !value && "sk-date-input--empty"
            )}
          />
        </div>

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-auto shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Очистить дату"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
