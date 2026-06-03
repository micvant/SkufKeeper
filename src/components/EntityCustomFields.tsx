"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CustomFieldDefinitionDto, CustomFieldEntityType, CustomFieldValueDto } from "@/lib/custom-field";

interface EntityCustomFieldsProps {
  entityType: CustomFieldEntityType;
  entityId: string;
  initialFields?: CustomFieldValueDto[];
}

export function EntityCustomFields({ entityType, entityId, initialFields = [] }: EntityCustomFieldsProps) {
  const [values, setValues] = useState<CustomFieldValueDto[]>(initialFields);
  const [definitions, setDefinitions] = useState<CustomFieldDefinitionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedDefinitionId, setSelectedDefinitionId] = useState("");
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(initialFields);
  }, [initialFields]);

  useEffect(() => {
    fetch(`/api/custom-fields/definitions?entityType=${entityType}`)
      .then(async (res) => (res.ok ? res.json() : []))
      .then(setDefinitions)
      .finally(() => setLoading(false));
  }, [entityType]);

  const usedDefinitionIds = new Set(values.map((v) => v.definitionId));
  const availableDefinitions = definitions.filter((d) => !usedDefinitionIds.has(d.id));

  async function handleAdd() {
    if (!selectedDefinitionId || !newValue.trim()) {
      setError("Выберите поле и введите значение");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/custom-fields/values", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          definitionId: selectedDefinitionId,
          value: newValue,
          ...(entityType === "item" ? { itemId: entityId } : { locationId: entityId }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");

      setValues((prev) => [...prev, data]);
      setAdding(false);
      setSelectedDefinitionId("");
      setNewValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editValue.trim()) {
      setError("Введите значение");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/custom-fields/values/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: editValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");

      setValues((prev) => prev.map((v) => (v.id === id ? data : v)));
      setEditingId(null);
      setEditValue("");
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
      const res = await fetch(`/api/custom-fields/values/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка");
      }
      setValues((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Загрузка полей...</p>;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-medium text-slate-700">Дополнительные поля</h2>
        {definitions.length > 0 && availableDefinitions.length > 0 && !adding && (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setSelectedDefinitionId(availableDefinitions[0]?.id ?? "");
              setError(null);
            }}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80"
          >
            <Plus className="h-4 w-4" />
            Добавить
          </button>
        )}
      </div>

      {definitions.length === 0 ? (
        <div className="px-4 py-4 text-sm text-slate-500">
          Сначала задайте названия полей в{" "}
          <Link href="/settings" className="font-medium text-primary hover:opacity-80">
            настройках
          </Link>
          .
        </div>
      ) : values.length === 0 && !adding ? (
        <div className="px-4 py-4 text-sm text-slate-500">
          Поля пока не добавлены. Нажмите «Добавить», чтобы заполнить нужные.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {values.map((field) => (
            <li key={field.id} className="px-4 py-3">
              {editingId === field.id ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400">{field.label}</p>
                  <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveEdit(field.id)}
                      disabled={saving}
                    >
                      <Check className="h-4 w-4" />
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null);
                        setEditValue("");
                      }}
                    >
                      <X className="h-4 w-4" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-400">{field.label}</p>
                    <p className="mt-0.5 text-sm text-slate-800">{field.value}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(field.id);
                        setEditValue(field.value);
                        setError(null);
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Редактировать"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(field.id)}
                      disabled={saving}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <div className="space-y-3 border-t border-slate-100 px-4 py-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-500">Поле</label>
            <select
              value={selectedDefinitionId}
              onChange={(e) => setSelectedDefinitionId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {availableDefinitions.map((def) => (
                <option key={def.id} value={def.id}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Значение"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Введите значение..."
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAdd} disabled={saving}>
              Сохранить
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setNewValue("");
                setError(null);
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      {error && <p className="border-t border-slate-100 px-4 py-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}
