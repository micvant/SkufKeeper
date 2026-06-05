"use client";

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
  const inputId = "expires-at";

  return (
    <div className={cn("min-w-0 max-w-full space-y-1.5", className)}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>

      <div className="sk-date-field min-w-0 max-w-full overflow-hidden">
        <input
          id={inputId}
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
    </div>
  );
}
