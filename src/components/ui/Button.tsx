"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-primary text-white hover:bg-primary-hover shadow-sm": variant === "primary",
            "border border-slate-200 bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200 dark:border-slate-400 dark:bg-slate-600 dark:text-white dark:shadow-md dark:hover:bg-slate-500":
              variant === "secondary",
            "border border-red-200 bg-red-50 text-red-600 shadow-sm hover:bg-red-100 dark:border-red-500/70 dark:bg-red-900/70 dark:text-red-100 dark:shadow-md dark:hover:bg-red-900/90":
              variant === "danger",
            "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50":
              variant === "ghost",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base w-full": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
