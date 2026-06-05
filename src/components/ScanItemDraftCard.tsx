"use client";

import Image from "next/image";
import { Camera, Check, Trash2, X } from "lucide-react";
import { IconPicker } from "@/components/IconPicker";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { QuantityField } from "@/components/QuantityField";
import { type IconName } from "@/lib/icons";
import { type ItemUnit } from "@/lib/item-units";
import { cn } from "@/lib/utils";
import { useRef } from "react";

export type ScanItemDraft = {
  id: string;
  name: string;
  quantity: string;
  unit: ItemUnit;
  description: string;
  photo: File | null;
  photoPreview: string | null;
  iconName: IconName | null;
  selected: boolean;
};

interface ScanItemDraftCardProps {
  draft: ScanItemDraft;
  onChange: (patch: Partial<ScanItemDraft>) => void;
  onRemove: () => void;
}

export function ScanItemDraftCard({ draft, onChange, onRemove }: ScanItemDraftCardProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  function setPhoto(file: File | null) {
    if (draft.photoPreview) URL.revokeObjectURL(draft.photoPreview);
    if (file) {
      onChange({
        photo: file,
        photoPreview: URL.createObjectURL(file),
        iconName: null,
      });
    } else {
      onChange({ photo: null, photoPreview: null });
    }
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  return (
    <li
      className={cn(
        "rounded-xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800",
        !draft.selected && "opacity-60"
      )}
    >
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          onClick={() => onChange({ selected: !draft.selected })}
          className={cn(
            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
            draft.selected
              ? "border-primary bg-primary text-white"
              : "border-slate-300 dark:border-slate-500"
          )}
          aria-label={draft.selected ? "Снять выбор" : "Выбрать"}
        >
          {draft.selected && <Check className="h-3.5 w-3.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <Input
            label="Название"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-700"
          aria-label="Убрать из списка"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {draft.selected && (
        <div className="space-y-3 border-t border-slate-100 px-3 pb-3 pt-3 dark:border-slate-700">
          <QuantityField
            quantity={draft.quantity}
            unit={draft.unit}
            onQuantityChange={(quantity) => onChange({ quantity })}
            onUnitChange={(unit) => onChange({ unit })}
          />

          <Textarea
            label="Описание (необязательно)"
            placeholder="Размер, цвет, примечание..."
            rows={2}
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Фото объекта</p>
            {draft.photoPreview ? (
              <div className="relative aspect-video max-h-32 w-full overflow-hidden rounded-xl bg-slate-100">
                <Image src={draft.photoPreview} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white"
                  aria-label="Удалить фото"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-4 text-sm text-slate-500 hover:border-primary/40 hover:bg-primary-light/50 dark:border-slate-600 dark:bg-slate-900/50"
              >
                <Camera className="h-5 w-5" />
                Добавить фото
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPhoto(file);
              }}
            />
          </div>

          {!draft.photo && (
            <IconPicker
              value={draft.iconName}
              onChange={(iconName) => onChange({ iconName })}
              variant="item"
              label="Иконка"
            />
          )}
        </div>
      )}
    </li>
  );
}
