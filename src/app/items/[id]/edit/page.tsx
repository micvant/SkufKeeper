"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { isNetworkOnline } from "@/lib/offline-sync";
import { enqueueOperation, isTempItemId } from "@/lib/offline-queue";
import { safeRouterRefresh } from "@/lib/safe-router";
import {
  buildItemEditSnapshot,
  isItemEditDirty,
  type ItemEditFormSnapshot,
} from "@/lib/item-edit-snapshot";
import { registerUnsavedBackHandler } from "@/lib/unsaved-changes-window";
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
  const [initialSnapshot, setInitialSnapshot] = useState<ItemEditFormSnapshot | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveSaving, setLeaveSaving] = useState(false);
  const pendingLeaveRef = useRef<(() => void) | null>(null);
  const backHrefRef = useRef("");

  const currentSnapshot = useMemo(
    () =>
      buildItemEditSnapshot({
        name,
        description,
        quantity,
        unit,
        locationId,
        minQuantity,
        expiresAt,
        iconName,
        removePhoto,
        photo,
        customFields,
      }),
    [
      name,
      description,
      quantity,
      unit,
      locationId,
      minQuantity,
      expiresAt,
      iconName,
      removePhoto,
      photo,
      customFields,
    ]
  );

  const isDirty = isItemEditDirty(initialSnapshot, currentSnapshot);

  useEffect(() => {
    params.then(({ id: itemId }) => {
      setId(itemId);
      backHrefRef.current = `/items/${itemId}`;

      Promise.all([
        fetch(`/api/items/${itemId}`).then((r) => r.json()),
        fetch("/api/locations?all=true").then((r) => r.json()),
      ])
        .then(([itemData, locationsData]: [Item, StorageLocation[]]) => {
          const loadedIcon =
            itemData.iconName && isValidIconName(itemData.iconName) ? itemData.iconName : null;
          const loadedExpires = itemData.expiresAt
            ? new Date(itemData.expiresAt).toISOString().slice(0, 10)
            : "";

          setName(itemData.name);
          setDescription(itemData.description || "");
          setQuantity(String(itemData.quantity));
          setUnit(parseItemUnit(itemData.unit));
          setLocationId(itemData.locationId);
          setCurrentPhoto(itemData.photoPath);
          setIconName(loadedIcon);
          setMinQuantity(itemData.minQuantity != null ? String(itemData.minQuantity) : "");
          setExpiresAt(loadedExpires);
          setCustomFields(itemData.customFields ?? []);
          setLocations(locationsData);

          setInitialSnapshot(
            buildItemEditSnapshot({
              name: itemData.name,
              description: itemData.description || "",
              quantity: String(itemData.quantity),
              unit: parseItemUnit(itemData.unit),
              locationId: itemData.locationId,
              minQuantity: itemData.minQuantity != null ? String(itemData.minQuantity) : "",
              expiresAt: loadedExpires,
              iconName: loadedIcon,
              removePhoto: false,
              photo: null,
              customFields: itemData.customFields ?? [],
            })
          );
        })
        .finally(() => setFetching(false));
    });
  }, [params]);

  const requestLeave = useCallback(
    (leave: () => void) => {
      if (!isDirty) {
        leave();
        return;
      }
      pendingLeaveRef.current = leave;
      setLeaveDialogOpen(true);
    },
    [isDirty]
  );

  useEffect(() => {
    registerUnsavedBackHandler(() => {
      requestLeave(() => router.push(backHrefRef.current || `/items/${id}`));
      return true;
    });
    return () => registerUnsavedBackHandler(undefined);
  }, [requestLeave, router, id]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || fetching) return;
    window.history.pushState({ skufEditGuard: true }, "");
    const onPopState = () => {
      window.history.pushState({ skufEditGuard: true }, "");
      requestLeave(() => router.back());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isDirty, fetching, requestLeave, router]);

  async function saveItem(): Promise<boolean> {
    if (!name.trim()) {
      setError("Введите название");
      return false;
    }
    if (parseItemQuantityStrict(quantity) === null) {
      setError("Укажите корректное количество");
      return false;
    }

    setError("");

    if ((photo || removePhoto) && !isNetworkOnline()) {
      setError("Изменение фото доступно только онлайн");
      return false;
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
        return false;
      }
      enqueueOperation({ type: "item.update", itemId: id, payload: jsonPayload });
      setInitialSnapshot(currentSnapshot);
      return true;
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

    setInitialSnapshot(currentSnapshot);
    setPhoto(null);
    setRemovePhoto(false);
    safeRouterRefresh(router);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await saveItem();
      if (ok) router.push(`/items/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeaveSave() {
    setLeaveSaving(true);
    try {
      const ok = await saveItem();
      if (ok && pendingLeaveRef.current) {
        setLeaveDialogOpen(false);
        pendingLeaveRef.current();
        pendingLeaveRef.current = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLeaveSaving(false);
    }
  }

  function handleLeaveDiscard() {
    setLeaveDialogOpen(false);
    const leave = pendingLeaveRef.current;
    pendingLeaveRef.current = null;
    leave?.();
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Загрузка...</p>
      </div>
    );
  }

  const showIconPicker = !photo && (!currentPhoto || removePhoto);
  const backHref = `/items/${id}`;

  return (
    <div>
      <Header
        title="Редактировать объект"
        backHref={isDirty ? undefined : backHref}
        onBack={isDirty ? () => requestLeave(() => router.push(backHref)) : undefined}
      />

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
          onPhotoChange={(file) => {
            setPhoto(file);
            if (file) setRemovePhoto(false);
          }}
          onRemoveCurrent={() => {
            setRemovePhoto(true);
            setPhoto(null);
          }}
          label="Фото объекта"
        />

        {showIconPicker && <IconPicker value={iconName} onChange={setIconName} variant="item" />}

        <EntityCustomFields
          entityType="item"
          entityId={id}
          initialFields={customFields}
          onFieldsChange={setCustomFields}
        />

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" size="lg" disabled={loading || leaveSaving}>
          {loading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>

      <UnsavedChangesDialog
        open={leaveDialogOpen}
        saving={leaveSaving}
        onSave={handleLeaveSave}
        onDiscard={handleLeaveDiscard}
        onCancel={() => {
          setLeaveDialogOpen(false);
          pendingLeaveRef.current = null;
        }}
      />
    </div>
  );
}
