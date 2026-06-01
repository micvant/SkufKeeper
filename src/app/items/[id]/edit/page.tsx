"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Item, StorageLocation } from "@/types";

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id: itemId }) => {
      setId(itemId);

      Promise.all([
        fetch(`/api/items/${itemId}`).then((r) => r.json()),
        fetch("/api/locations?all=true").then((r) => r.json()),
      ]).then(([itemData, locationsData]: [Item, StorageLocation[]]) => {
        setName(itemData.name);
        setDescription(itemData.description || "");
        setQuantity(String(itemData.quantity));
        setLocationId(itemData.locationId);
        setCurrentPhoto(itemData.photoPath);
        setLocations(locationsData);
      }).finally(() => setFetching(false));
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
      formData.append("description", description.trim());
      formData.append("quantity", quantity);
      formData.append("locationId", locationId);
      if (photo) formData.append("photo", photo);
      if (removePhoto) formData.append("removePhoto", "true");

      const res = await fetch(`/api/items/${id}`, { method: "PUT", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ошибка");

      router.push(`/items/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="Редактировать объект" backHref={`/items/${id}`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
        <Input
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Количество"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Место хранения</label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <Textarea
          label="Описание"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <PhotoUpload
          currentPhoto={currentPhoto}
          onPhotoChange={setPhoto}
          onRemoveCurrent={() => setRemovePhoto(true)}
          label="Фото объекта"
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>
    </div>
  );
}
