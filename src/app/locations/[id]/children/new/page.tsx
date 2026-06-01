"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LocationQRCode } from "@/components/LocationQRCode";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { StorageLocation } from "@/types";

export default function NewChildLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [parentId, setParentId] = useState("");
  const [parentName, setParentName] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<StorageLocation | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setParentId(id);
      fetch(`/api/locations/${id}`)
        .then((res) => res.json())
        .then((data: StorageLocation) => setParentName(data.name));
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Введите название");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("parentId", parentId);
      if (description.trim()) formData.append("description", description.trim());
      if (photo) formData.append("photo", photo);

      const res = await fetch("/api/locations", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ошибка");
      if (!data.qrToken) throw new Error("QR-код не был создан");

      setCreated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  if (created?.qrToken) {
    return (
      <div>
        <Header title="Место создано" backHref={`/locations/${parentId}`} />

        <div className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">{created.name}</p>
            <p className="mt-1 text-sm text-emerald-600">
              Добавлено в «{parentName}»
            </p>
          </div>

          <LocationQRCode qrToken={created.qrToken} locationName={created.name} />

          <Button size="lg" onClick={() => router.push(`/locations/${created.id}`)}>
            Перейти к месту
          </Button>
          <Link
            href={`/locations/${parentId}`}
            className="block text-center text-sm text-slate-500 hover:text-slate-700"
          >
            Назад к «{parentName}»
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Новое вложенное место" backHref={`/locations/${parentId || ""}`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
        {parentName && (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            Внутри: <span className="font-medium text-slate-900">{parentName}</span>
          </p>
        )}

        <Input
          label="Название"
          placeholder="Например: Верхняя полка"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Textarea
          label="Описание (необязательно)"
          placeholder="Что здесь хранится..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <PhotoUpload onPhotoChange={setPhoto} label="Фото места" />

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" size="lg" disabled={loading || !parentId}>
          {loading ? "Сохранение..." : "Создать место"}
        </Button>
      </form>
    </div>
  );
}
