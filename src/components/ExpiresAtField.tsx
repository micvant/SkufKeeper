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

      <div className="sk-date-shell relative min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
        {!value && (
          <span
            className="pointer-events-none absolute inset-y-0 left-4 z-[1] flex items-center text-sm text-slate-400 dark:text-slate-500"
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
            "sk-date-input w-full min-w-0 border-0 bg-transparent py-2.5 text-sm text-slate-900",
            "focus:outline-none focus:ring-0",
            "dark:text-slate-100",
            value ? "sk-date-input--filled pl-4 pr-11" : "px-4 pr-10",
            !value && "sk-date-input--empty"
          )}
        />

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 z-[2] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Очистить дату"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-medium text-primary hover:underline dark:text-primary-foreground"
        >
          Очистить дату
        </button>
      ) : null}
    </div>
  );
}
