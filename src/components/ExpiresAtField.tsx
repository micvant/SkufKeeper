"use client";

import { cn } from "@/lib/utils";

interface ExpiresAtFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function sanitizeIsoDateInput(raw: string): string {
  let v = raw.replace(/[^\d-]/g, "");
  if (v.length > 10) v = v.slice(0, 10);
  return v;
}

/** Значение yyyy-mm-dd для API. На телефоне — текст с шаблоном, на ПК — нативный date. */
export function ExpiresAtField({
  value,
  onChange,
  label = "Срок годности (необязательно)",
  className,
}: ExpiresAtFieldProps) {
  const inputId = "expires-at";

  return (
    <div className={cn("min-w-0 max-w-full space-y-1.5", className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>

      {/* Телефон: видимый шаблон ГГГГ-ММ-ДД */}
      <div className="min-w-0 max-w-full md:hidden">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="2026-12-31"
          value={value}
          onChange={(e) => onChange(sanitizeIsoDateInput(e.target.value))}
          className={cn(
            "w-full max-w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          )}
        />
        <p className="mt-1 text-xs text-slate-500">Год-месяц-день, через дефис</p>
      </div>

      {/* ПК: календарь */}
      <div className="sk-date-field hidden min-w-0 max-w-full overflow-hidden md:block">
        <input
          id={`${inputId}-desktop`}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "sk-date-input w-full max-w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          )}
        />
      </div>

      {value && !ISO_DATE_RE.test(value) && (
        <p className="text-xs text-amber-600 dark:text-amber-400">Укажите дату в формате 2026-12-31</p>
      )}
    </div>
  );
}
