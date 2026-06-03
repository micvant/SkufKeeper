import { ITEM_UNIT_IDS, ITEM_UNITS, sanitizeQuantityInput, type ItemUnit } from "@/lib/item-units";
import { cn } from "@/lib/utils";

interface QuantityFieldProps {
  quantity: string;
  unit: ItemUnit;
  onQuantityChange: (value: string) => void;
  onUnitChange: (value: ItemUnit) => void;
  className?: string;
}

export function QuantityField({
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
  className,
}: QuantityFieldProps) {
  const config = ITEM_UNITS[unit];

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-slate-700">Количество</label>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={quantity}
          onChange={(e) => onQuantityChange(sanitizeQuantityInput(e.target.value))}
          placeholder={config.step < 1 ? "0,1" : "1"}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as ItemUnit)}
          className="w-[min(100%,11rem)] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {ITEM_UNIT_IDS.map((id) => (
            <option key={id} value={id}>
              {ITEM_UNITS[id].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
