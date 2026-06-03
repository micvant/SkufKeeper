"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  APP_THEME_STORAGE_KEY,
  DEFAULT_APP_THEME,
  parseAppTheme,
  type AppThemeId,
} from "@/lib/app-theme";
import {
  COLOR_SCHEME_STORAGE_KEY,
  DEFAULT_COLOR_SCHEME,
  parseColorScheme,
  resolveColorScheme,
  type ColorSchemeId,
} from "@/lib/color-scheme";
import { safeGetItem, safeSetItem } from "@/lib/safe-storage";
import { isNetworkOnline } from "@/lib/offline-sync";

interface ThemeContextValue {
  theme: AppThemeId;
  colorScheme: ColorSchemeId;
  setTheme: (theme: AppThemeId) => void;
  setColorScheme: (scheme: ColorSchemeId) => void;
  saving: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_APP_THEME,
  colorScheme: DEFAULT_COLOR_SCHEME,
  setTheme: () => {},
  setColorScheme: () => {},
  saving: false,
});

function applyTheme(theme: AppThemeId) {
  document.documentElement.setAttribute("data-app-theme", theme);
}

function applyResolvedColorScheme(preference: ColorSchemeId) {
  const resolved = resolveColorScheme(preference);
  document.documentElement.setAttribute("data-color-scheme", resolved);
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_APP_THEME,
  initialColorScheme = DEFAULT_COLOR_SCHEME,
}: {
  children: React.ReactNode;
  initialTheme?: AppThemeId;
  initialColorScheme?: ColorSchemeId;
}) {
  const [theme, setThemeState] = useState<AppThemeId>(initialTheme);
  const [colorScheme, setColorSchemeState] = useState<ColorSchemeId>(initialColorScheme);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    applyTheme(initialTheme);
    applyResolvedColorScheme(initialColorScheme);
    setThemeState(initialTheme);
    setColorSchemeState(initialColorScheme);
    setReady(true);
  }, [initialTheme, initialColorScheme]);

  function applyStoredPreferences() {
    const storedTheme = parseAppTheme(safeGetItem(APP_THEME_STORAGE_KEY));
    const storedScheme = parseColorScheme(safeGetItem(COLOR_SCHEME_STORAGE_KEY));
    setThemeState(storedTheme);
    setColorSchemeState(storedScheme);
    applyTheme(storedTheme);
    applyResolvedColorScheme(storedScheme);
  }

  useEffect(() => {
    if (!ready) return;

    if (!isNetworkOnline()) {
      applyStoredPreferences();
      return;
    }

    fetch("/api/user/settings")
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { appTheme?: string; appColorScheme?: string };
          const serverTheme = parseAppTheme(data.appTheme);
          const serverScheme = parseColorScheme(data.appColorScheme);
          setThemeState(serverTheme);
          setColorSchemeState(serverScheme);
          applyTheme(serverTheme);
          applyResolvedColorScheme(serverScheme);
          safeSetItem(APP_THEME_STORAGE_KEY, serverTheme);
          safeSetItem(COLOR_SCHEME_STORAGE_KEY, serverScheme);
          return;
        }
        applyStoredPreferences();
      })
      .catch(() => {
        applyStoredPreferences();
      });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    applyTheme(theme);
  }, [theme, ready]);

  useEffect(() => {
    if (!ready) return;
    applyResolvedColorScheme(colorScheme);

    if (colorScheme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyResolvedColorScheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [colorScheme, ready]);

  async function patchSettings(patch: { appTheme?: AppThemeId; appColorScheme?: ColorSchemeId }) {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { appTheme?: string; appColorScheme?: string };
      if (data.appTheme) {
        const saved = parseAppTheme(data.appTheme);
        setThemeState(saved);
        applyTheme(saved);
        safeSetItem(APP_THEME_STORAGE_KEY, saved);
      }
      if (data.appColorScheme) {
        const saved = parseColorScheme(data.appColorScheme);
        setColorSchemeState(saved);
        applyResolvedColorScheme(saved);
        safeSetItem(COLOR_SCHEME_STORAGE_KEY, saved);
      }
    } finally {
      setSaving(false);
    }
  }

  async function setTheme(next: AppThemeId) {
    setThemeState(next);
    applyTheme(next);
    safeSetItem(APP_THEME_STORAGE_KEY, next);
    await patchSettings({ appTheme: next });
  }

  async function setColorScheme(next: ColorSchemeId) {
    setColorSchemeState(next);
    applyResolvedColorScheme(next);
    safeSetItem(COLOR_SCHEME_STORAGE_KEY, next);
    await patchSettings({ appColorScheme: next });
  }

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, setColorScheme, saving }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
