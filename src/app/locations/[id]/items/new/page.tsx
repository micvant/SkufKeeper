"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { IconPicker } from "@/components/IconPicker";
import { Input } from "@/components/ui/Input";
import { type IconName } from "@/lib/icons";
import { Textarea } from "@/components/ui/Textarea";
import { QuantityField } from "@/components/QuantityField";
import { DEFAULT_ITEM_UNIT, type ItemUnit } from "@/lib/item-units";
import { Button } from "@/components/ui/Button";
import { CustomFieldInput } from "@/components/CustomFieldInput";
import { useUserSettings } from "@/hooks/useUserSettings";

export default function NewItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [locationId, setLocationId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<ItemUnit>(DEFAULT_ITEM_UNIT);
  const [photo, setPhoto] = useState<File | null>(null);
  const [iconName, setIconName] = useState<IconName | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const { settings } = useUserSettings();

  useEffect(() => {
    params.then(({ id }) => setLocationId(id));
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Введите название");
      return;
    }

    const resolvedId = locationId || (await params).id;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("locationId", resolvedId);
      formData.append("quantity", quantity);
      formData.append("unit", unit);
      if (description.trim()) formData.append("description", description.trim());
      if (customFieldValue.trim()) formData.append("customFieldValue", customFieldValue.trim());
      if (photo) formData.append("photo", photo);
      else if (iconName) formData.append("iconName", iconName);

      const res = await fetch("/api/items", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ошибка");

      router.push(`/locations/${resolvedId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header title="Новый объект" backHref={`/locations/${locationId || "..."}`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
        <Input
          label="Название"
          placeholder="Например: Отвёртка крестовая"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <QuantityField
          quantity={quantity}
          unit={unit}
          onQuantityChange={setQuantity}
          onUnitChange={setUnit}
        />

        <Textarea
          label="Описание (необязательно)"
          placeholder="Размер, цвет, серийный номер..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <CustomFieldInput
          label={settings?.itemCustomFieldLabel}
          value={customFieldValue}
          onChange={setCustomFieldValue}
        />

        <PhotoUpload onPhotoChange={setPhoto} label="Фото объекта" />

        {!photo && (
          <IconPicker value={iconName} onChange={setIconName} variant="item" />
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Сохранение..." : "Добавить объект"}
        </Button>
      </form>
    </div>
  );
}
