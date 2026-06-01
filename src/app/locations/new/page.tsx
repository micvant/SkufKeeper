"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function NewLocationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (description.trim()) formData.append("description", description.trim());
      if (photo) formData.append("photo", photo);

      const res = await fetch("/api/locations", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ошибка");

      router.push(`/locations/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header title="Новое место хранения" backHref="/" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
        <Input
          label="Название"
          placeholder="Например: Шкаф в спальне"
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

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Сохранение..." : "Создать место"}
        </Button>
      </form>
    </div>
  );
}
