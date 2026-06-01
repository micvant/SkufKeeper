import { cn } from "@/lib/utils";
import {
  DEFAULT_ITEM_ICON,
  DEFAULT_LOCATION_ICON,
  ENTITY_ICONS,
  ICON_NAMES,
  type IconName,
} from "@/lib/icons";

interface IconPickerProps {
  value: IconName | null;
  onChange: (icon: IconName | null) => void;
  variant?: "location" | "item";
  label?: string;
}

export function IconPicker({
  value,
  onChange,
  variant = "item",
  label = "Иконка (если нет фото)",
}: IconPickerProps) {
  const defaultIcon = variant === "location" ? DEFAULT_LOCATION_ICON : DEFAULT_ITEM_ICON;
  const selected = value ?? defaultIcon;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
        {ICON_NAMES.map((name) => {
          const Icon = ENTITY_ICONS[name];
          const isSelected = selected === name;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name === defaultIcon && value === null ? null : name)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-xl border-2 transition-colors",
                isSelected
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600"
              )}
              title={name}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
