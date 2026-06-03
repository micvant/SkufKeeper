"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  CUSTOM_FIELD_TYPES,
  type CustomFieldDefinitionDto,
  type CustomFieldEntityType,
  type CustomFieldType,
} from "@/lib/custom-field";

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
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>("text");
  const [newOptions, setNewOptions] = useState<string[]>([""]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOptions, setEditOptions] = useState<string[]>([""]);
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

  function resetCreateForm() {
    setNewLabel("");
    setNewFieldType("text");
    setNewOptions([""]);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/custom-fields/definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          label: newLabel.trim(),
          fieldType: newFieldType,
          options: newFieldType === "enum" ? newOptions : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");

      setFields((prev) => [...prev, data]);
      resetCreateForm();
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
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveOptions(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/custom-fields/definitions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: editOptions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");

      setFields((prev) => prev.map((field) => (field.id === id ? data : field)));
      setEditingId(null);
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
                <li key={field.id} className="px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{field.label}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {field.fieldType === "enum" ? "Перечисление" : "Текст"}
                        </span>
                      </div>
                      {field.fieldType === "enum" && field.options.length > 0 && editingId !== field.id && (
                        <p className="mt-1 text-xs text-slate-500">{field.options.join(" · ")}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {field.fieldType === "enum" && editingId !== field.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(field.id);
                            setEditOptions(field.options.length > 0 ? [...field.options, ""] : [""]);
                            setError(null);
                          }}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          aria-label={`Изменить варианты ${field.label}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(field.id)}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Удалить поле ${field.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {editingId === field.id && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      <p className="text-xs font-medium text-slate-500">Варианты перечисления</p>
                      {editOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) =>
                              setEditOptions((prev) =>
                                prev.map((value, i) => (i === index ? e.target.value : value))
                              )
                            }
                            placeholder={`Вариант ${index + 1}`}
                            className="min-w-0 flex-1"
                          />
                          {editOptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditOptions((prev) => prev.filter((_, i) => i !== index))
                              }
                              className="rounded-lg px-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              aria-label="Удалить вариант"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditOptions((prev) => [...prev, ""])}
                        >
                          <Plus className="h-4 w-4" />
                          Вариант
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSaveOptions(field.id)}
                          disabled={saving}
                        >
                          <Check className="h-4 w-4" />
                          Сохранить
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAdd} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
            <Input
              label="Название поля"
              placeholder="Например: Состояние"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Тип поля</label>
              <select
                value={newFieldType}
                onChange={(e) => {
                  setNewFieldType(e.target.value as CustomFieldType);
                  if (e.target.value !== "enum") setNewOptions([""]);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {CUSTOM_FIELD_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {newFieldType === "enum" && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Варианты</p>
                {newOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) =>
                        setNewOptions((prev) =>
                          prev.map((value, i) => (i === index ? e.target.value : value))
                        )
                      }
                      placeholder={`Вариант ${index + 1}`}
                      className="min-w-0 flex-1"
                    />
                    {newOptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewOptions((prev) => prev.filter((_, i) => i !== index))}
                        className="rounded-lg px-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Удалить вариант"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setNewOptions((prev) => [...prev, ""])}
                >
                  <Plus className="h-4 w-4" />
                  Добавить вариант
                </Button>
              </div>
            )}

            <Button type="submit" variant="secondary" disabled={saving || !newLabel.trim()}>
              <Plus className="h-4 w-4" />
              Добавить поле
            </Button>
          </form>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </section>
  );
}
