"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import type { StorageLocation } from "@/types";
import { isNetworkOnline } from "@/lib/offline-sync";
import { enqueueOperation, isTempItemId } from "@/lib/offline-queue";

interface ItemMoveDialogProps {
  itemId: string;
  currentLocationId: string;
  open: boolean;
  onClose: () => void;
}

export function ItemMoveDialog({
  itemId,
  currentLocationId,
  open,
  onClose,
}: ItemMoveDialogProps) {
  const router = useRouter();
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [targetId, setTargetId] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/locations?all=true")
      .then((r) => r.json())
      .then((data: StorageLocation[]) => {
        setLocations(data.filter((l) => l.id !== currentLocationId));
      });
    setTargetId("");
    setComment("");
    setError("");
  }, [open, currentLocationId]);

  if (!open) return null;

  async function handleMove() {
    if (!targetId) {
      setError("Выберите место");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!isNetworkOnline()) {
        if (isTempItemId(itemId)) {
          setError("Дождитесь синхронизации нового объекта");
          return;
        }
        enqueueOperation({
          type: "item.move",
          itemId,
          locationId: targetId,
          comment: comment || null,
        });
        onClose();
        router.refresh();
        return;
      }

      const res = await fetch(`/api/items/${itemId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: targetId, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      onClose();
      router.push(`/items/${itemId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl"
        role="dialog"
        aria-labelledby="move-dialog-title"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="move-dialog-title" className="flex items-center gap-2 font-semibold text-slate-900">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Переместить объект
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700">Куда</label>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        >
          <option value="">Выберите место…</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        <div className="mt-4">
          <Textarea
            label="Комментарий (необязательно)"
            placeholder="Например: отдал соседу, на дачу…"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" className="flex-1" disabled={loading} onClick={handleMove}>
            {loading ? "…" : "Переместить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
