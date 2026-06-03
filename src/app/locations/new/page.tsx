"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LocationAppearanceFields } from "@/components/LocationAppearanceFields";
import { LocationQRCode } from "@/components/LocationQRCode";
import { Input } from "@/components/ui/Input";
import type { LocationColorSlug } from "@/lib/colors";
import { type IconName } from "@/lib/icons";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { StorageLocation } from "@/types";

export default function NewLocationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [iconName, setIconName] = useState<IconName | null>(null);
  const [color, setColor] = useState<LocationColorSlug | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<StorageLocation | null>(null);

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
      else {
        formData.append("iconName", iconName ?? "");
        formData.append("color", color ?? "");
      }

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
        <Header title="Место создано" backHref="/" />

        <div className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">{created.name}</p>
            <p className="mt-1 text-sm text-primary">Место хранения успешно добавлено</p>
          </div>

          <LocationQRCode qrToken={created.qrToken} locationName={created.name} />

          <Button size="lg" onClick={() => router.push(`/locations/${created.id}`)}>
            Перейти к месту
          </Button>
          <Link href="/" className="block text-center text-sm text-slate-500 hover:text-slate-700">
            На главную
          </Link>
        </div>
      </div>
    );
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

        {!photo && (
          <LocationAppearanceFields
            iconName={iconName}
            color={color}
            onIconChange={setIconName}
            onColorChange={setColor}
          />
        )}

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
