export const LOCATION_COLORS = {
  emerald: {
    label: "Изумрудный",
    bg: "bg-emerald-50 dark:bg-emerald-900/45",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-500",
    swatch: "bg-emerald-500",
  },
  blue: {
    label: "Синий",
    bg: "bg-blue-50 dark:bg-blue-900/45",
    text: "text-blue-600 dark:text-blue-300",
    ring: "ring-blue-500",
    swatch: "bg-blue-500",
  },
  violet: {
    label: "Фиолетовый",
    bg: "bg-violet-50 dark:bg-violet-900/45",
    text: "text-violet-600 dark:text-violet-300",
    ring: "ring-violet-500",
    swatch: "bg-violet-500",
  },
  rose: {
    label: "Розовый",
    bg: "bg-rose-50 dark:bg-rose-900/45",
    text: "text-rose-600 dark:text-rose-300",
    ring: "ring-rose-500",
    swatch: "bg-rose-500",
  },
  amber: {
    label: "Янтарный",
    bg: "bg-amber-50 dark:bg-amber-900/45",
    text: "text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500",
    swatch: "bg-amber-500",
  },
  cyan: {
    label: "Голубой",
    bg: "bg-cyan-50 dark:bg-cyan-900/45",
    text: "text-cyan-600 dark:text-cyan-300",
    ring: "ring-cyan-500",
    swatch: "bg-cyan-500",
  },
  orange: {
    label: "Оранжевый",
    bg: "bg-orange-50 dark:bg-orange-900/45",
    text: "text-orange-600 dark:text-orange-300",
    ring: "ring-orange-500",
    swatch: "bg-orange-500",
  },
  indigo: {
    label: "Индиго",
    bg: "bg-indigo-50 dark:bg-indigo-900/45",
    text: "text-indigo-600 dark:text-indigo-300",
    ring: "ring-indigo-500",
    swatch: "bg-indigo-500",
  },
  lime: {
    label: "Лайм",
    bg: "bg-lime-50 dark:bg-lime-900/45",
    text: "text-lime-600 dark:text-lime-300",
    ring: "ring-lime-500",
    swatch: "bg-lime-500",
  },
  fuchsia: {
    label: "Пурпурный",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-900/45",
    text: "text-fuchsia-600 dark:text-fuchsia-300",
    ring: "ring-fuchsia-500",
    swatch: "bg-fuchsia-500",
  },
  teal: {
    label: "Бирюзовый",
    bg: "bg-teal-50 dark:bg-teal-900/45",
    text: "text-teal-600 dark:text-teal-300",
    ring: "ring-teal-500",
    swatch: "bg-teal-500",
  },
  slate: {
    label: "Серый",
    bg: "bg-slate-100 dark:bg-slate-700/50",
    text: "text-slate-600 dark:text-slate-300",
    ring: "ring-slate-500",
    swatch: "bg-slate-500",
  },
  red: {
    label: "Красный",
    bg: "bg-red-50 dark:bg-red-900/45",
    text: "text-red-600 dark:text-red-300",
    ring: "ring-red-500",
    swatch: "bg-red-500",
  },
  sky: {
    label: "Небесный",
    bg: "bg-sky-50 dark:bg-sky-900/45",
    text: "text-sky-600 dark:text-sky-300",
    ring: "ring-sky-500",
    swatch: "bg-sky-500",
  },
  pink: {
    label: "Розовый светлый",
    bg: "bg-pink-50 dark:bg-pink-900/45",
    text: "text-pink-600 dark:text-pink-300",
    ring: "ring-pink-500",
    swatch: "bg-pink-500",
  },
  stone: {
    label: "Каменный",
    bg: "bg-stone-100 dark:bg-stone-800/45",
    text: "text-stone-600 dark:text-stone-300",
    ring: "ring-stone-500",
    swatch: "bg-stone-500",
  },
} as const;

export type LocationColorSlug = keyof typeof LOCATION_COLORS;

export const LOCATION_COLOR_SLUGS = Object.keys(LOCATION_COLORS) as LocationColorSlug[];

export const DEFAULT_LOCATION_COLOR: LocationColorSlug = "emerald";

export function isValidLocationColor(slug: string): slug is LocationColorSlug {
  return slug in LOCATION_COLORS;
}

export function parseLocationColor(slug: string | null | undefined): LocationColorSlug {
  if (slug && isValidLocationColor(slug)) return slug;
  return DEFAULT_LOCATION_COLOR;
}

export function getLocationColorStyles(slug: string | null | undefined) {
  return LOCATION_COLORS[parseLocationColor(slug)];
}

/** Все Tailwind-классы цветов — для safelist в tailwind.config.ts */
export const LOCATION_COLOR_CLASSNAMES = LOCATION_COLOR_SLUGS.flatMap((slug) => {
  const c = LOCATION_COLORS[slug];
  return [c.bg, c.text, c.ring, c.swatch];
});
