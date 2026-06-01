export const APP_THEMES = {
  emerald: {
    label: "Изумрудный",
    swatch: "bg-emerald-600",
    primary: "5 150 105",
    primaryHover: "4 120 87",
    primaryLight: "236 253 245",
    primaryMuted: "209 250 229",
    primaryText: "4 120 87",
  },
  brown: {
    label: "Коричневый",
    swatch: "bg-amber-900",
    primary: "120 53 15",
    primaryHover: "92 40 12",
    primaryLight: "255 251 235",
    primaryMuted: "254 243 199",
    primaryText: "120 53 15",
  },
  blue: {
    label: "Синий",
    swatch: "bg-blue-600",
    primary: "37 99 235",
    primaryHover: "29 78 216",
    primaryLight: "239 246 255",
    primaryMuted: "219 234 254",
    primaryText: "29 78 216",
  },
  violet: {
    label: "Фиолетовый",
    swatch: "bg-violet-600",
    primary: "124 58 237",
    primaryHover: "109 40 217",
    primaryLight: "245 243 255",
    primaryMuted: "237 233 254",
    primaryText: "109 40 217",
  },
  slate: {
    label: "Серый",
    swatch: "bg-slate-600",
    primary: "71 85 105",
    primaryHover: "51 65 85",
    primaryLight: "248 250 252",
    primaryMuted: "241 245 249",
    primaryText: "51 65 85",
  },
} as const;

export type AppThemeId = keyof typeof APP_THEMES;

export const APP_THEME_IDS = Object.keys(APP_THEMES) as AppThemeId[];

export const DEFAULT_APP_THEME: AppThemeId = "emerald";

export const APP_THEME_STORAGE_KEY = "skufkeeper-app-theme";

export function isValidAppTheme(id: string): id is AppThemeId {
  return id in APP_THEMES;
}

export function parseAppTheme(id: string | null | undefined): AppThemeId {
  if (id && isValidAppTheme(id)) return id;
  return DEFAULT_APP_THEME;
}
