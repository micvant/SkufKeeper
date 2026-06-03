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
  saving: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_APP_THEME,
  setTheme: () => {},
  saving: false,
});

function applyTheme(theme: AppThemeId) {
  document.documentElement.setAttribute("data-app-theme", theme);
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_APP_THEME,
}: {
  children: React.ReactNode;
  initialTheme?: AppThemeId;
}) {
  const [theme, setThemeState] = useState<AppThemeId>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    applyTheme(initialTheme);
    setThemeState(initialTheme);
    setReady(true);
  }, [initialTheme]);

  useEffect(() => {
    if (!ready) return;

    fetch("/api/user/settings")
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { appTheme?: string };
          const serverTheme = parseAppTheme(data.appTheme);
          setThemeState(serverTheme);
          applyTheme(serverTheme);
          localStorage.setItem(APP_THEME_STORAGE_KEY, serverTheme);
          return;
        }

        const stored = localStorage.getItem(APP_THEME_STORAGE_KEY);
        const localTheme = parseAppTheme(stored);
        setThemeState(localTheme);
        applyTheme(localTheme);
      })
      .catch(() => {
        const stored = localStorage.getItem(APP_THEME_STORAGE_KEY);
        const localTheme = parseAppTheme(stored);
        setThemeState(localTheme);
        applyTheme(localTheme);
      });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    applyTheme(theme);
  }, [theme, ready]);

  async function setTheme(next: AppThemeId) {
    setThemeState(next);
    applyTheme(next);
    localStorage.setItem(APP_THEME_STORAGE_KEY, next);

    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appTheme: next }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { appTheme?: string };
      const saved = parseAppTheme(data.appTheme);
      setThemeState(saved);
      applyTheme(saved);
      localStorage.setItem(APP_THEME_STORAGE_KEY, saved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, saving }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
