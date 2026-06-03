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
import { StockFields } from "@/components/StockFields";
import { VoiceNameInput } from "@/components/VoiceNameInput";
import { EntityCustomFields } from "@/components/EntityCustomFields";
import { DEFAULT_ITEM_UNIT, parseItemQuantityStrict, type ItemUnit } from "@/lib/item-units";
import { persistCustomFieldDrafts, type DraftCustomField } from "@/lib/custom-field";
import { Button } from "@/components/ui/Button";
import { isNetworkOnline } from "@/lib/offline-sync";
import { queueCreateItem } from "@/lib/offline-item-helpers";
import { getCachedJson, locationCacheKey } from "@/lib/offline-cache";
import type { StorageLocation } from "@/types";

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
  const [minQuantity, setMinQuantity] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [iconName, setIconName] = useState<IconName | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draftCustomFields, setDraftCustomFields] = useState<DraftCustomField[]>([]);

  useEffect(() => {
    params.then(({ id }) => setLocationId(id));
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Введите название");
      return;
    }
    if (parseItemQuantityStrict(quantity) === null) {
      setError("Укажите корректное количество");
      return;
    }

    const resolvedId = locationId || (await params).id;

    setLoading(true);
    setError("");

    try {
      if (photo && !isNetworkOnline()) {
        setError("Загрузка фото доступна только при подключении к интернету");
        return;
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        locationId: resolvedId,
        quantity: parseFloat(quantity.replace(",", ".")) || 1,
        unit,
        minQuantity: minQuantity.trim() ? parseFloat(minQuantity.replace(",", ".")) : null,
        expiresAt: expiresAt || null,
        iconName: !photo ? iconName : null,
      };

      if (!isNetworkOnline()) {
        const loc = getCachedJson<StorageLocation>(locationCacheKey(resolvedId));
        queueCreateItem(payload, loc?.name);
        router.push(`/locations/${resolvedId}`);
        router.refresh();
        return;
      }

      if (photo || draftCustomFields.length > 0) {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("locationId", resolvedId);
        formData.append("quantity", quantity);
        formData.append("unit", unit);
        if (payload.description) formData.append("description", payload.description);
        if (minQuantity.trim()) formData.append("minQuantity", minQuantity.trim());
        if (expiresAt) formData.append("expiresAt", expiresAt);
        if (photo) formData.append("photo", photo);
        else if (iconName) formData.append("iconName", iconName);

        const res = await fetch("/api/items", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка");

        if (draftCustomFields.length > 0) {
          await persistCustomFieldDrafts("item", data.id, draftCustomFields);
        }
      } else {
        const res = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка");
      }

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
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              label="Название"
              placeholder="Например: Отвёртка крестовая"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="pt-7">
            <VoiceNameInput onResult={(text) => setName(text)} />
          </div>
        </div>

        <QuantityField
          quantity={quantity}
          unit={unit}
          onQuantityChange={setQuantity}
          onUnitChange={setUnit}
        />

        <StockFields
          minQuantity={minQuantity}
          expiresAt={expiresAt}
          onMinQuantityChange={setMinQuantity}
          onExpiresAtChange={setExpiresAt}
        />

        <Textarea
          label="Описание (необязательно)"
          placeholder="Размер, цвет, серийный номер..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <PhotoUpload onPhotoChange={setPhoto} label="Фото объекта" />

        {!photo && (
          <IconPicker value={iconName} onChange={setIconName} variant="item" />
        )}

        <EntityCustomFields
          entityType="item"
          draftFields={draftCustomFields}
          onDraftChange={setDraftCustomFields}
        />

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
