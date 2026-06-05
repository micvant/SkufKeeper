"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { OnboardingTour } from "@/components/OnboardingTour";

const OPEN_EVENT = "skuf-open-onboarding";

type OnboardingContextValue = {
  openTour: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}

async function markOnboardingCompleted() {
  await fetch("/api/user/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ onboardingCompleted: true }),
  });
}

interface OnboardingProviderProps {
  children: ReactNode;
  /** From server: show tour on first authenticated visit */
  initialShow: boolean;
}

export function OnboardingProvider({ children, initialShow }: OnboardingProviderProps) {
  const [open, setOpen] = useState(initialShow);

  const finish = useCallback(async () => {
    setOpen(false);
    await markOnboardingCompleted();
  }, []);

  const openTour = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const value = useMemo(() => ({ openTour }), [openTour]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingTour open={open} onComplete={finish} onSkip={finish} />
    </OnboardingContext.Provider>
  );
}

/** For settings page without requiring context hook in tree edge cases */
export function dispatchOpenOnboarding() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}
