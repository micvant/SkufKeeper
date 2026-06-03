"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CustomFieldDefinitionDto, CustomFieldEntityType } from "@/lib/custom-field";

interface CustomFieldDefinitionsEditorProps {
  entityType: CustomFieldEntityType;
  title: string;
  description: string;
}

export function CustomFieldDefinitionsEditor({
  entityType,
  title,
  description,
}: CustomFieldDefinitionsEditorProps) {
  const [fields, setFields] = useState<CustomFieldDefinitionDto[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFields() {
    const res = await fetch(`/api/custom-fields/definitions?entityType=${entityType}`);
    if (res.ok) setFields(await res.json());
  }

  useEffect(() => {
    loadFields().finally(() => setLoading(false));
  }, [entityType]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/custom-fields/definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, label: newLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");

      setFields((prev) => [...prev, data]);
      setNewLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/custom-fields/definitions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка");
      }
      setFields((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="text-sm font-medium text-slate-700">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">{description}</p>

      {loading ? (
        <p className="mt-3 text-sm text-slate-500">Загрузка...</p>
      ) : (
        <div className="mt-3 space-y-3">
          {fields.length > 0 && (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {fields.map((field) => (
                <li key={field.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="text-sm text-slate-800">{field.label}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(field.id)}
                    disabled={saving}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Удалить поле ${field.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="Название нового поля"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="min-w-0 flex-1"
            />
            <Button type="submit" variant="secondary" disabled={saving || !newLabel.trim()}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Добавить</span>
            </Button>
          </form>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </section>
  );
}
