export const LOCATION_COLORS = {
  emerald: { label: "Изумрудный", bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-500", swatch: "bg-emerald-500" },
  blue: { label: "Синий", bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-500", swatch: "bg-blue-500" },
  violet: { label: "Фиолетовый", bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-500", swatch: "bg-violet-500" },
  rose: { label: "Розовый", bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-500", swatch: "bg-rose-500" },
  amber: { label: "Янтарный", bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-500", swatch: "bg-amber-500" },
  cyan: { label: "Голубой", bg: "bg-cyan-50", text: "text-cyan-600", ring: "ring-cyan-500", swatch: "bg-cyan-500" },
  orange: { label: "Оранжевый", bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-500", swatch: "bg-orange-500" },
  indigo: { label: "Индиго", bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-500", swatch: "bg-indigo-500" },
  lime: { label: "Лайм", bg: "bg-lime-50", text: "text-lime-600", ring: "ring-lime-500", swatch: "bg-lime-500" },
  fuchsia: { label: "Пурпурный", bg: "bg-fuchsia-50", text: "text-fuchsia-600", ring: "ring-fuchsia-500", swatch: "bg-fuchsia-500" },
  teal: { label: "Бирюзовый", bg: "bg-teal-50", text: "text-teal-600", ring: "ring-teal-500", swatch: "bg-teal-500" },
  slate: { label: "Серый", bg: "bg-slate-100", text: "text-slate-600", ring: "ring-slate-500", swatch: "bg-slate-500" },
  red: { label: "Красный", bg: "bg-red-50", text: "text-red-600", ring: "ring-red-500", swatch: "bg-red-500" },
  sky: { label: "Небесный", bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-500", swatch: "bg-sky-500" },
  pink: { label: "Розовый светлый", bg: "bg-pink-50", text: "text-pink-600", ring: "ring-pink-500", swatch: "bg-pink-500" },
  stone: { label: "Каменный", bg: "bg-stone-100", text: "text-stone-600", ring: "ring-stone-500", swatch: "bg-stone-500" },
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
