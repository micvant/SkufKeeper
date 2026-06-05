"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ONBOARDING_STEPS } from "@/lib/onboarding-steps";
import { cn } from "@/lib/utils";

interface OnboardingTourProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ open, onComplete, onSkip }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const reset = useCallback(() => setStepIndex(0), []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const step = ONBOARDING_STEPS[stepIndex];
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
  const Icon = step.icon;

  function handleNext() {
    if (isLast) {
      onComplete();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {stepIndex + 1} из {ONBOARDING_STEPS.length}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label="Пропустить"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={cn(
            "mx-4 mt-2 flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br",
            step.illustrationClass
          )}
        >
          <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/80 shadow-lg dark:bg-slate-900/50">
            <Icon className="h-14 w-14 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>

        <div className="px-5 pb-2 pt-5">
          <h2 id="onboarding-title" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {step.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {step.description}
          </p>
        </div>

        <div className="flex justify-center gap-1.5 px-5 py-3">
          {ONBOARDING_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === stepIndex ? "w-6 bg-primary" : "w-1.5 bg-slate-300 dark:bg-slate-600"
              )}
              aria-hidden
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-4 dark:border-slate-700">
          <Button type="button" size="lg" onClick={handleNext}>
            {isLast ? "Начать" : "Далее"}
          </Button>
          <div className="flex gap-2">
            {stepIndex > 0 ? (
              <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" />
                Назад
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className={stepIndex > 0 ? "flex-1" : "w-full"}
              onClick={onSkip}
            >
              Пропустить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
