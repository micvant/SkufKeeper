"use client";

import { useEffect, useMemo, useState } from "react";
import type { StorageLocation } from "@/types";

interface LocationParentSelectProps {
  locationId: string;
  currentParentId: string | null;
  onMoved?: () => void;
}

function buildPath(
  loc: StorageLocation,
  byId: Map<string, StorageLocation>
): string {
  const parts: string[] = [loc.name];
  let parentId = loc.parentId;
  while (parentId) {
    const parent = byId.get(parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    parentId = parent.parentId;
  }
  return parts.join(" → ");
}

export function LocationParentSelect({
  locationId,
  currentParentId,
  onMoved,
}: LocationParentSelectProps) {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [parentId, setParentId] = useState<string>(currentParentId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setParentId(currentParentId ?? "");
  }, [currentParentId]);

  useEffect(() => {
    fetch("/api/locations?all=true")
      .then((res) => res.json())
      .then(setLocations);
  }, []);

    const { byId, options } = useMemo(() => {
    const byIdMap = new Map(locations.map((l) => [l.id, l]));
    const blocked = new Set<string>([locationId]);

    function markDescendants(id: string) {
      for (const loc of locations) {
        if (loc.parentId === id && !blocked.has(loc.id)) {
          blocked.add(loc.id);
          markDescendants(loc.id);
        }
      }
    }
    markDescendants(locationId);

    const opts = locations
      .filter((l) => !blocked.has(l.id))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      .map((l) => ({
        id: l.id,
        label: buildPath(l, byIdMap),
      }));

    return { byId: byIdMap, options: opts };
  }, [locations, locationId]);

  async function handleMove() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/locations/${locationId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: parentId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");

      setSuccess("Место перемещено");
      onMoved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  const changed = (parentId || null) !== (currentParentId || null);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Переместить в другое место</p>
      <select
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">— Корень (без родителя) —</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      {currentParentId && byId.get(currentParentId) && (
        <p className="text-xs text-slate-500">
          Сейчас внутри: {byId.get(currentParentId)!.name}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-primary">{success}</p>}
      <button
        type="button"
        disabled={!changed || loading}
        onClick={handleMove}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Перемещение..." : "Переместить"}
      </button>
    </div>
  );
}
