"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  APP_THEME_STORAGE_KEY,
  DEFAULT_APP_THEME,
  parseAppTheme,
  type AppThemeId,
} from "@/lib/app-theme";

interface ThemeContextValue {
  theme: AppThemeId;
  setTheme: (theme: AppThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_APP_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeId>(DEFAULT_APP_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(APP_THEME_STORAGE_KEY);
    setThemeState(parseAppTheme(stored));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute("data-app-theme", theme);
    localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
  }, [theme, ready]);

  function setTheme(next: AppThemeId) {
    setThemeState(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
