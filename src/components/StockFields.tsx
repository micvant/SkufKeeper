"use client";

import { Input } from "@/components/ui/Input";

interface StockFieldsProps {
  minQuantity: string;
  expiresAt: string;
  onMinQuantityChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
}

export function StockFields({
  minQuantity,
  expiresAt,
  onMinQuantityChange,
  onExpiresAtChange,
}: StockFieldsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-sm font-medium text-slate-700">Запасы</p>
      <Input
        label="Минимальный остаток (необязательно)"
        type="text"
        inputMode="decimal"
        placeholder="Например: 2"
        value={minQuantity}
        onChange={(e) => onMinQuantityChange(e.target.value)}
      />
      <Input
        label="Срок годности (необязательно)"
        type="date"
        value={expiresAt}
        onChange={(e) => onExpiresAtChange(e.target.value)}
      />
      <p className="text-xs text-slate-500">
        При низком остатке и приближающемся сроке объект появится на главной в блоке напоминаний.
      </p>
    </div>
  );
}
