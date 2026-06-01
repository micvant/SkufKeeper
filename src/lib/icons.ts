import {
  Archive,
  Backpack,
  Battery,
  Book,
  Box,
  Briefcase,
  Camera,
  Car,
  Coffee,
  Droplet,
  Flame,
  Folder,
  Gamepad2,
  Gem,
  Gift,
  Glasses,
  Hammer,
  Headphones,
  Heart,
  Home,
  Key,
  Laptop,
  Lightbulb,
  MapPin,
  Monitor,
  Music,
  Package,
  Paintbrush,
  Pen,
  Phone,
  Plug,
  Scissors,
  Shirt,
  ShoppingBag,
  Smartphone,
  Star,
  Tag,
  TreePine,
  Utensils,
  Watch,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const ENTITY_ICONS = {
  "map-pin": MapPin,
  home: Home,
  archive: Archive,
  folder: Folder,
  box: Box,
  package: Package,
  backpack: Backpack,
  briefcase: Briefcase,
  "shopping-bag": ShoppingBag,
  key: Key,
  tag: Tag,
  wrench: Wrench,
  hammer: Hammer,
  scissors: Scissors,
  pen: Pen,
  paintbrush: Paintbrush,
  book: Book,
  camera: Camera,
  phone: Phone,
  smartphone: Smartphone,
  laptop: Laptop,
  monitor: Monitor,
  headphones: Headphones,
  watch: Watch,
  glasses: Glasses,
  shirt: Shirt,
  lightbulb: Lightbulb,
  plug: Plug,
  battery: Battery,
  coffee: Coffee,
  utensils: Utensils,
  droplet: Droplet,
  flame: Flame,
  "tree-pine": TreePine,
  car: Car,
  gamepad: Gamepad2,
  music: Music,
  gem: Gem,
  gift: Gift,
  heart: Heart,
  star: Star,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ENTITY_ICONS;

export const ICON_NAMES = Object.keys(ENTITY_ICONS) as IconName[];

export const DEFAULT_LOCATION_ICON: IconName = "map-pin";
export const DEFAULT_ITEM_ICON: IconName = "package";

export function isValidIconName(name: string): name is IconName {
  return name in ENTITY_ICONS;
}

export function parseIconName(
  name: string | null | undefined,
  fallback: IconName
): IconName {
  if (name && isValidIconName(name)) return name;
  return fallback;
}

export function getEntityIcon(name: string | null | undefined, fallback: IconName): LucideIcon {
  return ENTITY_ICONS[parseIconName(name, fallback)];
}
