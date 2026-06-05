"use client";

import { Button } from "@/components/ui/Button";

interface UnsavedChangesDialogProps {
  open: boolean;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  open,
  saving = false,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-dialog-title"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800">
        <h2 id="unsaved-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Сохранить изменения?
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Если уйти сейчас, правки будут потеряны.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button type="button" size="lg" disabled={saving} onClick={onSave}>
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button type="button" variant="danger" size="lg" disabled={saving} onClick={onDiscard}>
            Не сохранять
          </Button>
          <Button type="button" variant="secondary" size="lg" disabled={saving} onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
}
