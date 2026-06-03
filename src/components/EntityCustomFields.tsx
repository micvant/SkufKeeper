"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  CustomFieldValueInput,
  defaultValueForDefinition,
} from "@/components/CustomFieldValueInput";
import type {
  CustomFieldDefinitionDto,
  CustomFieldEntityType,
  CustomFieldValueDto,
  DraftCustomField,
} from "@/lib/custom-field";
import { safeRouterRefresh } from "@/lib/safe-router";

type FieldRow = {
  id: string;
  definitionId: string;
  label: string;
  value: string;
};

interface EntityCustomFieldsProps {
  entityType: CustomFieldEntityType;
  entityId?: string;
  initialFields?: CustomFieldValueDto[];
  draftFields?: DraftCustomField[];
  onDraftChange?: (fields: DraftCustomField[]) => void;
  onFieldsChange?: (fields: CustomFieldValueDto[]) => void;
}

function toRowsFromSaved(fields: CustomFieldValueDto[]): FieldRow[] {
  return fields.map((field) => ({
    id: field.id,
    definitionId: field.definitionId,
    label: field.label,
    value: field.value,
  }));
}

function toRowsFromDraft(fields: DraftCustomField[]): FieldRow[] {
  return fields.map((field) => ({
    id: field.localId,
    definitionId: field.definitionId,
    label: field.label,
    value: field.value,
  }));
}

function toDraft(fields: FieldRow[]): DraftCustomField[] {
  return fields.map((field) => ({
    localId: field.id,
    definitionId: field.definitionId,
    label: field.label,
    value: field.value,
  }));
}

function toSavedDto(rows: FieldRow[]): CustomFieldValueDto[] {
  return rows.map((field) => ({
    id: field.id,
    definitionId: field.definitionId,
    label: field.label,
    value: field.value,
  }));
}

export function EntityCustomFields({
  entityType,
  entityId,
  initialFields = [],
  draftFields = [],
  onDraftChange,
  onFieldsChange,
}: EntityCustomFieldsProps) {
  const router = useRouter();
  const isDraft = !entityId && !!onDraftChange;

  const [values, setValues] = useState<FieldRow[]>(() =>
    isDraft ? toRowsFromDraft(draftFields) : toRowsFromSaved(initialFields)
  );
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
    if (isDraft) {
      setValues(toRowsFromDraft(draftFields));
    }
  }, [draftFields, isDraft]);

  useEffect(() => {
    if (!isDraft && entityId) {
      setValues(toRowsFromSaved(initialFields));
    }
  }, [entityId, isDraft]);

  function applySavedValues(updater: FieldRow[] | ((prev: FieldRow[]) => FieldRow[])) {
    setValues((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onFieldsChange?.(toSavedDto(next));
      return next;
    });
    safeRouterRefresh(router);
  }

  useEffect(() => {
    fetch(`/api/custom-fields/definitions?entityType=${entityType}`)
      .then(async (res) => (res.ok ? res.json() : []))
      .then(setDefinitions)
      .finally(() => setLoading(false));
  }, [entityType]);

  const selectedDefinition = definitions.find((d) => d.id === selectedDefinitionId);

  useEffect(() => {
    if (!adding) return;
    setNewValue(defaultValueForDefinition(selectedDefinition));
  }, [adding, selectedDefinitionId, selectedDefinition]);

  function getDefinition(definitionId: string) {
    return definitions.find((d) => d.id === definitionId);
  }

  function updateDraft(next: FieldRow[]) {
    setValues(next);
    onDraftChange?.(toDraft(next));
  }

  const usedDefinitionIds = new Set(values.map((v) => v.definitionId));
  const availableDefinitions = definitions.filter((d) => !usedDefinitionIds.has(d.id));

  async function handleAdd() {
    if (!selectedDefinitionId || !newValue.trim()) {
      setError("Выберите поле и введите значение");
      return;
    }

    const definition = definitions.find((d) => d.id === selectedDefinitionId);
    if (!definition) return;

    if (isDraft) {
      updateDraft([
        ...values,
        {
          id: crypto.randomUUID(),
          definitionId: definition.id,
          label: definition.label,
          value: newValue.trim(),
        },
      ]);
      setAdding(false);
      setSelectedDefinitionId("");
      setNewValue("");
      setError(null);
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

      applySavedValues((prev) => [...prev, data]);
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

    if (isDraft) {
      updateDraft(values.map((v) => (v.id === id ? { ...v, value: editValue.trim() } : v)));
      setEditingId(null);
      setEditValue("");
      setError(null);
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

      applySavedValues((prev) => prev.map((v) => (v.id === id ? data : v)));
      setEditingId(null);
      setEditValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (isDraft) {
      updateDraft(values.filter((v) => v.id !== id));
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/custom-fields/values/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка");
      }
      applySavedValues((prev) => prev.filter((v) => v.id !== id));
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
              const first = availableDefinitions[0];
              setSelectedDefinitionId(first?.id ?? "");
              setNewValue(defaultValueForDefinition(first));
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
          {isDraft
            ? "При необходимости добавьте дополнительные поля."
            : "Поля пока не добавлены. Нажмите «Добавить», чтобы заполнить нужные."}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {values.map((field) => (
            <li key={field.id} className="px-4 py-3">
              {editingId === field.id ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-400">{field.label}</p>
                  <CustomFieldValueInput
                    definition={getDefinition(field.definitionId)}
                    value={editValue}
                    onChange={setEditValue}
                    autoFocus
                  />
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
              onChange={(e) => {
                const nextId = e.target.value;
                setSelectedDefinitionId(nextId);
                setNewValue(defaultValueForDefinition(definitions.find((d) => d.id === nextId)));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {availableDefinitions.map((def) => (
                <option key={def.id} value={def.id}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
          <CustomFieldValueInput
            definition={selectedDefinition}
            value={newValue}
            onChange={setNewValue}
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
