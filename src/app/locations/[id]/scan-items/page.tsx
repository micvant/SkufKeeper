"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, Loader2, Sparkles, X } from "lucide-react";
import { Header } from "@/components/Navigation";
import { Button } from "@/components/ui/Button";
import { ScanItemDraftCard, type ScanItemDraft } from "@/components/ScanItemDraftCard";
import { AI_MAX_PHOTOS } from "@/lib/ai-constants";
import { DEFAULT_ITEM_UNIT, parseItemQuantityStrict } from "@/lib/item-units";
import { cn } from "@/lib/utils";

function newDraftId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptyDraft(partial?: Partial<Pick<ScanItemDraft, "name" | "quantity">>): ScanItemDraft {
  return {
    id: newDraftId(),
    name: partial?.name ?? "",
    quantity: partial?.quantity ?? "1",
    unit: DEFAULT_ITEM_UNIT,
    description: "",
    photo: null,
    photoPreview: null,
    iconName: null,
    selected: true,
  };
}

export default function ScanItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [locationId, setLocationId] = useState("");
  const [photos, setPhotos] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [drafts, setDrafts] = useState<ScanItemDraft[]>([]);
  const [step, setStep] = useState<"photos" | "review">("photos");
  const [recognizing, setRecognizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    params.then(({ id }) => setLocationId(id));
  }, [params]);

  const resolvedId = locationId;
  const backHref = resolvedId ? `/locations/${resolvedId}` : "/";

  const revokePreviews = useCallback((list: { preview: string }[]) => {
    for (const p of list) URL.revokeObjectURL(p.preview);
  }, []);

  const revokeDraftPhotos = useCallback((list: ScanItemDraft[]) => {
    for (const d of list) {
      if (d.photoPreview) URL.revokeObjectURL(d.photoPreview);
    }
  }, []);

  useEffect(() => {
    return () => {
      revokePreviews(photos);
      revokeDraftPhotos(drafts);
    };
  }, [photos, drafts, revokePreviews, revokeDraftPhotos]);

  function addPhotos(fileList: FileList | null) {
    if (!fileList?.length) return;
    const room = AI_MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setError(`Не более ${AI_MAX_PHOTOS} фото за раз`);
      return;
    }
    const next = [...photos];
    for (const file of Array.from(fileList).slice(0, room)) {
      next.push({ id: newDraftId(), file, preview: URL.createObjectURL(file) });
    }
    setPhotos(next);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleRecognize() {
    if (photos.length === 0) {
      setError("Сделайте хотя бы одно фото");
      return;
    }
    setRecognizing(true);
    setError("");
    try {
      const formData = new FormData();
      for (const p of photos) formData.append("photos", p.file);

      const res = await fetch("/api/ai/recognize-items", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка распознавания");

      const items = (data.items ?? []) as { name: string; quantity: number }[];
      if (items.length === 0) {
        setError("На фото не найдено предметов. Попробуйте другой ракурс или добавьте вручную.");
        return;
      }

      revokeDraftPhotos(drafts);
      setDrafts(
        items.map((item) =>
          createEmptyDraft({ name: item.name, quantity: String(item.quantity) })
        )
      );
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setRecognizing(false);
    }
  }

  function updateDraft(id: string, patch: Partial<ScanItemDraft>) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function removeDraft(id: string) {
    setDrafts((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target?.photoPreview) URL.revokeObjectURL(target.photoPreview);
      return prev.filter((d) => d.id !== id);
    });
  }

  async function createItem(draft: ScanItemDraft, locId: string) {
    const quantity = parseItemQuantityStrict(draft.quantity);
    if (quantity === null) {
      throw new Error(`Укажите корректное количество для «${draft.name.trim()}»`);
    }

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      locationId: locId,
      quantity,
      unit: draft.unit,
      iconName: !draft.photo ? draft.iconName : null,
    };

    if (draft.photo) {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("locationId", locId);
      formData.append("quantity", draft.quantity);
      formData.append("unit", draft.unit);
      if (payload.description) formData.append("description", payload.description);
      formData.append("photo", draft.photo);

      const res = await fetch("/api/items", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения");
      return data;
    }

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка сохранения");
    return data;
  }

  async function handleSave() {
    const selected = drafts.filter((d) => d.selected && d.name.trim());
    if (selected.length === 0) {
      setError("Выберите хотя бы один объект");
      return;
    }

    const locId = resolvedId || (await params).id;
    setSaving(true);
    setError("");
    try {
      for (const draft of selected) {
        await createItem(draft, locId);
      }
      router.push(`/locations/${locId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  function handleBackToPhotos() {
    revokeDraftPhotos(drafts);
    setStep("photos");
    setDrafts([]);
  }

  const selectedCount = drafts.filter((d) => d.selected && d.name.trim()).length;

  return (
    <div className="page-bottom-actions min-w-0 pb-28">
      <Header title="Добавить по фото" backHref={backHref} />

      <div className="mx-auto max-w-lg space-y-4 px-4 py-4 md:px-8">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Сфотографируйте полку или стол — появится список предметов. Уточните название, количество,
          описание, фото или иконку перед добавлением.
        </p>

        {step === "photos" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <Image src={p.preview} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                    aria-label="Удалить фото"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < AI_MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200",
                    "bg-slate-50 text-slate-500 transition-colors hover:border-primary/40 hover:bg-primary-light/50"
                  )}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs font-medium">Фото</span>
                </button>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple={photos.length < AI_MAX_PHOTOS - 1}
              className="hidden"
              onChange={(e) => addPhotos(e.target.files)}
            />

            <p className="text-xs text-slate-500">
              До {AI_MAX_PHOTOS} фото. Крупный план — точнее распознавание. Нужен интернет.
            </p>

            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={recognizing || photos.length === 0}
              onClick={handleRecognize}
            >
              {recognizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Распознаём…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Распознать предметы
                </>
              )}
            </Button>
          </>
        )}

        {step === "review" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Найдено: {drafts.length}
              </p>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={handleBackToPhotos}
              >
                Другие фото
              </button>
            </div>

            <ul className="space-y-3">
              {drafts.map((d) => (
                <ScanItemDraftCard
                  key={d.id}
                  draft={d}
                  onChange={(patch) => updateDraft(d.id, patch)}
                  onRemove={() => removeDraft(d.id)}
                />
              ))}
            </ul>

            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={saving || selectedCount === 0}
              onClick={handleSave}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Добавляем…
                </>
              ) : (
                `Добавить ${selectedCount} ${selectedCount === 1 ? "объект" : "объектов"}`
              )}
            </Button>
          </>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
