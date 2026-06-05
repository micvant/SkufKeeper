import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Package,
  QrCode,
  Search,
  Camera,
  BarChart3,
  Settings,
  Sparkles,
  Layers,
} from "lucide-react";

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for illustration background */
  illustrationClass: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Добро пожаловать в SkufKeeper",
    description:
      "Это приложение для учёта вещей и мест хранения: шкафы, полки, ящики с инструментами. Всё в одном месте — на телефоне или компьютере.",
    icon: Layers,
    illustrationClass: "from-primary/30 to-primary/10",
  },
  {
    id: "locations",
    title: "Места хранения",
    description:
      "Создавайте места с названием, описанием и фото. Внутри места можно добавлять вложенные полки и ящики — получается дерево, как в реальном шкафу.",
    icon: MapPin,
    illustrationClass: "from-emerald-400/40 to-teal-200/30 dark:from-emerald-600/30 dark:to-teal-900/20",
  },
  {
    id: "items",
    title: "Объекты",
    description:
      "В каждое место добавляйте вещи: фото, описание, количество и единицу измерения (шт., кг, л и т.д.). Можно задавать срок годности и следить за остатками.",
    icon: Package,
    illustrationClass: "from-amber-400/40 to-orange-200/30 dark:from-amber-600/30 dark:to-orange-900/20",
  },
  {
    id: "qr",
    title: "QR-коды на местах",
    description:
      "У каждого места есть QR-код. Наклейте его на полку или ящик — отсканировав с телефона, сразу откроете это место и список вещей.",
    icon: QrCode,
    illustrationClass: "from-violet-400/40 to-purple-200/30 dark:from-violet-600/30 dark:to-purple-900/20",
  },
  {
    id: "search",
    title: "Поиск и избранное",
    description:
      "На главной — быстрый поиск по названию. Часто используемые места можно добавить в избранное звёздочкой, чтобы открывать в один тап.",
    icon: Search,
    illustrationClass: "from-sky-400/40 to-blue-200/30 dark:from-sky-600/30 dark:to-blue-900/20",
  },
  {
    id: "ai-photo",
    title: "Добавление по фото (ИИ)",
    description:
      "Сфотографируйте полку или стол — ИИ предложит список предметов. Проверьте названия и количество, при необходимости отредактируйте и сохраните в место.",
    icon: Camera,
    illustrationClass: "from-rose-400/40 to-pink-200/30 dark:from-rose-600/30 dark:to-pink-900/20",
  },
  {
    id: "stats",
    title: "Статистика и напоминания",
    description:
      "Раздел «Статистика» показывает дерево хранения и сводки. На главной появятся предупреждения, если заканчивается срок годности или мало остатков.",
    icon: BarChart3,
    illustrationClass: "from-indigo-400/40 to-indigo-200/30 dark:from-indigo-600/30 dark:to-indigo-900/20",
  },
  {
    id: "settings",
    title: "Настройки",
    description:
      "Тема, акцентный цвет, дополнительные поля для всех объектов и мест, резервная копия. Приложение можно добавить на домашний экран iPhone как PWA.",
    icon: Settings,
    illustrationClass: "from-slate-400/30 to-slate-200/20 dark:from-slate-500/30 dark:to-slate-800/30",
  },
  {
    id: "done",
    title: "Готово!",
    description:
      "Создайте первое место хранения и добавьте в него объект. Инструкцию можно открыть снова в настройках.",
    icon: Sparkles,
    illustrationClass: "from-primary/35 to-amber-200/25 dark:from-primary/25 dark:to-amber-900/20",
  },
];
