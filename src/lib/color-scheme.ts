export const COLOR_SCHEMES = {
  light: { label: "Светлая" },
  dark: { label: "Тёмная" },
  system: { label: "Как в системе" },
} as const;

export type ColorSchemeId = keyof typeof COLOR_SCHEMES;

export const COLOR_SCHEME_IDS = Object.keys(COLOR_SCHEMES) as ColorSchemeId[];

export const DEFAULT_COLOR_SCHEME: ColorSchemeId = "system";

export const COLOR_SCHEME_STORAGE_KEY = "skufkeeper-color-scheme";

export function isValidColorScheme(id: string): id is ColorSchemeId {
  return id in COLOR_SCHEMES;
}

export function parseColorScheme(id: string | null | undefined): ColorSchemeId {
  if (id && isValidColorScheme(id)) return id;
  return DEFAULT_COLOR_SCHEME;
}

export function resolveColorScheme(preference: ColorSchemeId): "light" | "dark" {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}
