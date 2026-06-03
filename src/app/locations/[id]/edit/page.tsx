"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LocationAppearanceFields } from "@/components/LocationAppearanceFields";
import { Input } from "@/components/ui/Input";
import { isValidLocationColor, type LocationColorSlug } from "@/lib/colors";
import { isValidIconName, type IconName } from "@/lib/icons";
import { Textarea } from "@/components/ui/Textarea";
import { EntityCustomFields } from "@/components/EntityCustomFields";
import { Button } from "@/components/ui/Button";
import { LocationParentSelect } from "@/components/LocationParentSelect";
import type { CustomFieldValueDto } from "@/lib/custom-field";
import type { StorageLocation } from "@/types";

export default function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [iconName, setIconName] = useState<IconName | null>(null);
  const [color, setColor] = useState<LocationColorSlug | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldValueDto[]>([]);

  useEffect(() => {
    params.then(({ id: locationId }) => {
      setId(locationId);
      fetch(`/api/locations/${locationId}`)
        .then((res) => res.json())
        .then((data: StorageLocation) => {
          setName(data.name);
          setDescription(data.description || "");
          setCurrentPhoto(data.photoPath);
          setIconName(data.iconName && isValidIconName(data.iconName) ? data.iconName : null);
          setColor(data.color && isValidLocationColor(data.color) ? data.color : null);
          setParentId(data.parentId);
          setCustomFields(data.customFields ?? []);
        })
        .finally(() => setFetching(false));
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
      if (photo) formData.append("photo", photo);
      if (removePhoto) formData.append("removePhoto", "true");
      if (!photo && (!currentPhoto || removePhoto)) {
        formData.append("iconName", iconName ?? "");
        formData.append("color", color ?? "");
      }

      const res = await fetch(`/api/locations/${id}`, { method: "PUT", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ошибка");

      router.refresh();
      router.push(`/locations/${id}`);
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

  const showIconPicker = !photo && (!currentPhoto || removePhoto);

  return (
    <div>
      <Header title="Редактировать место" backHref={`/locations/${id}`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
        <Input
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          label="Фото места"
        />

        {showIconPicker && (
          <LocationAppearanceFields
            iconName={iconName}
            color={color}
            onIconChange={setIconName}
            onColorChange={setColor}
          />
        )}

        {id && (
          <LocationParentSelect
            locationId={id}
            currentParentId={parentId}
            onMoved={() => {
              fetch(`/api/locations/${id}`)
                .then((res) => res.json())
                .then((data: StorageLocation) => setParentId(data.parentId));
            }}
          />
        )}

        <EntityCustomFields
          entityType="location"
          entityId={id}
          initialFields={customFields}
          onFieldsChange={setCustomFields}
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
