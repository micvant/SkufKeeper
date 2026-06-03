"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { IconPicker } from "@/components/IconPicker";
import { Input } from "@/components/ui/Input";
import { isValidIconName, type IconName } from "@/lib/icons";
import { Textarea } from "@/components/ui/Textarea";
import { QuantityField } from "@/components/QuantityField";
import { StockFields } from "@/components/StockFields";
import { VoiceNameInput } from "@/components/VoiceNameInput";
import { DEFAULT_ITEM_UNIT, parseItemQuantityStrict, parseItemUnit, type ItemUnit } from "@/lib/item-units";
import { EntityCustomFields } from "@/components/EntityCustomFields";
import { Button } from "@/components/ui/Button";
import { isNetworkOnline } from "@/lib/offline-sync";
import { enqueueOperation, isTempItemId } from "@/lib/offline-queue";
import { safeRouterRefresh } from "@/lib/safe-router";
import type { CustomFieldValueDto } from "@/lib/custom-field";
import type { Item, StorageLocation } from "@/types";

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<ItemUnit>(DEFAULT_ITEM_UNIT);
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [iconName, setIconName] = useState<IconName | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [customFields, setCustomFields] = useState<CustomFieldValueDto[]>([]);

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
        setUnit(parseItemUnit(itemData.unit));
        setLocationId(itemData.locationId);
        setCurrentPhoto(itemData.photoPath);
        setIconName(
          itemData.iconName && isValidIconName(itemData.iconName) ? itemData.iconName : null
        );
        setMinQuantity(
          itemData.minQuantity != null ? String(itemData.minQuantity) : ""
        );
        setExpiresAt(
          itemData.expiresAt
            ? new Date(itemData.expiresAt).toISOString().slice(0, 10)
            : ""
        );
        setCustomFields(itemData.customFields ?? []);
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
    if (parseItemQuantityStrict(quantity) === null) {
      setError("Укажите корректное количество");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if ((photo || removePhoto) && !isNetworkOnline()) {
        setError("Изменение фото доступно только онлайн");
        return;
      }

      const jsonPayload = {
        name: name.trim(),
        description: description.trim() || null,
        locationId,
        quantity: parseFloat(quantity.replace(",", ".")) || 1,
        unit,
        minQuantity: minQuantity.trim() ? parseFloat(minQuantity.replace(",", ".")) : null,
        expiresAt: expiresAt || null,
        iconName: !photo && (!currentPhoto || removePhoto) ? iconName : undefined,
      };

      if (!isNetworkOnline()) {
        if (isTempItemId(id)) {
          setError("Объект ещё не синхронизирован с сервером");
          return;
        }
        enqueueOperation({ type: "item.update", itemId: id, payload: jsonPayload });
        router.push(`/items/${id}`);
        return;
      }

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("quantity", quantity);
      formData.append("unit", unit);
      formData.append("locationId", locationId);
      formData.append("minQuantity", minQuantity.trim());
      if (expiresAt) formData.append("expiresAt", expiresAt);
      if (photo) formData.append("photo", photo);
      if (removePhoto) formData.append("removePhoto", "true");
      if (!photo && (!currentPhoto || removePhoto)) {
        formData.append("iconName", iconName ?? "");
      }

      const res = await fetch(`/api/items/${id}`, { method: "PUT", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Ошибка");

      safeRouterRefresh(router);
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

  const showIconPicker = !photo && (!currentPhoto || removePhoto);

  return (
    <div>
      <Header title="Редактировать объект" backHref={`/items/${id}`} />

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 px-4 py-6 md:px-8">
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              label="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Место хранения</label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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

        {showIconPicker && (
          <IconPicker value={iconName} onChange={setIconName} variant="item" />
        )}

        <EntityCustomFields
          entityType="item"
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
