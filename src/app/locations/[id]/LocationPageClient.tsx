"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  QrCode,
  Package,
  ChevronsDownUp,
  ChevronsUpDown,
  MapPin,
  ChevronRight,
  ArrowRightLeft,
  Copy,
  Sparkles,
} from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { cacheLocationForOffline, cacheQrTokenForOffline } from "@/lib/offline-store";
import { cacheJson, locationCacheKey } from "@/lib/offline-cache";
import { safeRouterRefresh } from "@/lib/safe-router";
import Image from "next/image";
import { Header } from "@/components/Navigation";
import { ItemCard, LocationCard } from "@/components/Cards";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { LocationQRCode } from "@/components/LocationQRCode";
import { LocationParentSelect } from "@/components/LocationParentSelect";
import { EntityIcon } from "@/components/EntityIcon";
import { getLocationColorStyles } from "@/lib/colors";
import { DEFAULT_LOCATION_ICON } from "@/lib/icons";
import { DETAIL_WIDTH, getUploadImageUrl } from "@/lib/image-url";
import { Button } from "@/components/ui/Button";
import { CustomFieldsDisplay } from "@/components/CustomFieldsDisplay";
import type { StorageLocation } from "@/types";

type SectionKey = "qr" | "children" | "items" | "move";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}

interface LocationPageClientProps {
  location: StorageLocation;
  isFavorite?: boolean;
}

export function LocationPageClient({
  location: initialLocation,
  isFavorite = false,
}: LocationPageClientProps) {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);
  const [customFields, setCustomFields] = useState(initialLocation.customFields ?? []);
  const id = location.id;

  useEffect(() => {
    setLocation(initialLocation);
    setCustomFields(initialLocation.customFields ?? []);
    cacheJson(locationCacheKey(initialLocation.id), initialLocation);
  }, [initialLocation]);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    cacheLocationForOffline({
      id: location.id,
      qrToken: location.qrToken,
      name: location.name,
    });
    if (location.qrToken) {
      cacheQrTokenForOffline(location.qrToken, location.id);
    }
  }, [location.id, location.qrToken, location.name]);

  useEffect(() => {
    function onItemSynced(e: Event) {
      const detail = (e as CustomEvent<{ tempId: string; item: { id: string } }>).detail;
      setLocation((prev) => ({
        ...prev,
        items: prev.items?.map((it) =>
          it.id === detail.tempId ? { ...it, id: detail.item.id } : it
        ),
      }));
    }
    function onSyncComplete() {
      safeRouterRefresh(router);
    }
    window.addEventListener("skufkeeper-item-synced", onItemSynced);
    window.addEventListener("skufkeeper-sync-complete", onSyncComplete);
    return () => {
      window.removeEventListener("skufkeeper-item-synced", onItemSynced);
      window.removeEventListener("skufkeeper-sync-complete", onSyncComplete);
    };
  }, [router]);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    qr: false,
    children: true,
    items: true,
    move: false,
  });

  function setSection(key: SectionKey, open: boolean) {
    setSections((prev) => ({ ...prev, [key]: open }));
  }

  function expandAllSections() {
    setSections({ qr: true, children: true, items: true, move: true });
  }

  function collapseAllSections() {
    setSections({ qr: false, children: false, items: false, move: false });
  }

  async function handleDeleteItem(itemId: string, itemName: string) {
    if (!confirm(`Удалить «${itemName}»?`)) return;

    setDeletingItemId(itemId);
    try {
      const { isNetworkOnline } = await import("@/lib/offline-sync");
      const { enqueueOperation, isTempItemId } = await import("@/lib/offline-queue");

      if (!isNetworkOnline()) {
        if (!isTempItemId(itemId)) {
          enqueueOperation({ type: "item.delete", itemId });
        }
        setLocation((prev) => ({
          ...prev,
          items: prev.items?.filter((item) => item.id !== itemId),
        }));
        return;
      }

      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (!res.ok) return;
      setLocation((prev) => ({
        ...prev,
        items: prev.items?.filter((item) => item.id !== itemId),
      }));
    } finally {
      setDeletingItemId(null);
    }
  }

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/locations/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/locations/${data.id}`);
    } catch {
      alert("Не удалось создать копию");
    } finally {
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    const hasChildren = (location.children?.length ?? 0) > 0;
    const message = hasChildren
      ? "Удалить место, все вложенные места и объекты?"
      : "Удалить место и все объекты в нём?";
    if (!confirm(message)) return;

    setDeleting(true);
    try {
      await fetch(`/api/locations/${id}`, { method: "DELETE" });
      router.push(location.parent ? `/locations/${location.parent.id}` : "/");
    } finally {
      setDeleting(false);
    }
  }

  const backHref = location.parent ? `/locations/${location.parent.id}` : "/";
  const childrenCount = location.children?.length ?? 0;
  const itemsCount = location.items?.length ?? 0;

  return (
    <div className="page-bottom-actions min-w-0 max-w-full overflow-x-hidden md:pb-6">
      <Header title={location.name} backHref={backHref} />

      <div className="mx-auto w-full min-w-0 max-w-lg space-y-3 px-4 py-4 md:max-w-2xl md:px-8 md:py-6">
        <div className="flex justify-end gap-2">
          <FavoriteButton locationId={id} initialFavorite={isFavorite} />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={duplicating}
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4" />
            {duplicating ? "…" : "Копия"}
          </Button>
        </div>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {location.photoPath ? (
            <div className="relative aspect-[16/10] max-h-48 w-full bg-slate-100">
              <Image
                src={getUploadImageUrl(location.photoPath, DETAIL_WIDTH)!}
                alt={location.name}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                priority
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div
              className={`flex items-center gap-4 p-4 ${getLocationColorStyles(location.color).bg}`}
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                <EntityIcon
                  iconName={location.iconName}
                  fallback={DEFAULT_LOCATION_ICON}
                  colorSlug={location.color}
                  iconClassName="h-8 w-8"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="sk-accent-chip inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium">
                    <FolderOpen className="h-3.5 w-3.5" />
                    {childrenCount} {childrenCount === 1 ? "место" : "мест"}
                  </span>
                  <span className="sk-accent-chip inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium">
                    <Package className="h-3.5 w-3.5" />
                    {itemsCount} {itemsCount === 1 ? "объект" : "объектов"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3">
            {location.photoPath && (
              <>
                <span className="sk-accent-chip inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium">
                  <FolderOpen className="h-3.5 w-3.5" />
                  {childrenCount} {childrenCount === 1 ? "место" : "мест"}
                </span>
                <span className="sk-accent-chip inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium">
                  <Package className="h-3.5 w-3.5" />
                  {itemsCount} {itemsCount === 1 ? "объект" : "объектов"}
                </span>
              </>
            )}
            {location.parent && (
              <Link
                href={`/locations/${location.parent.id}`}
                className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-light hover:text-primary-foreground sm:flex-none"
              >
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{location.parent.name}</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 sm:ml-0" />
              </Link>
            )}
          </div>
        </article>

        {location.description && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
            <DetailRow label="Описание" value={location.description} />
          </section>
        )}

        <CustomFieldsDisplay fields={customFields} />

        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Содержимое</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={expandAllSections}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
              Развернуть
            </button>
            <button
              type="button"
              onClick={collapseAllSections}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              <ChevronsDownUp className="h-3.5 w-3.5" />
              Свернуть
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <CollapsibleSection
            title={
              <span className="inline-flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                Вложенные места
              </span>
            }
            count={childrenCount}
            open={sections.children}
            onOpenChange={(open) => setSection("children", open)}
            actions={
              <Link href={`/locations/${id}/children/new`}>
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Добавить</span>
                </Button>
              </Link>
            }
          >
            {childrenCount > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {location.children!.map((child) => (
                  <LocationCard key={child.id} location={child} compact />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">Нет вложенных мест</p>
                <p className="mt-1 text-xs text-slate-400">
                  Например: полка, ящик или отделение внутри шкафа
                </p>
                <Link href={`/locations/${id}/children/new`} className="mt-4 inline-block">
                  <Button size="sm" variant="secondary">
                    <Plus className="h-4 w-4" />
                    Добавить место
                  </Button>
                </Link>
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title={
              <span className="inline-flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Объекты
              </span>
            }
            count={itemsCount}
            open={sections.items}
            onOpenChange={(open) => setSection("items", open)}
            actions={
              <div className="flex gap-1">
                <Link href={`/locations/${id}/scan-items`}>
                  <Button size="sm" variant="secondary" title="Добавить по фото (ИИ)">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">По фото</span>
                  </Button>
                </Link>
                <Link href={`/locations/${id}/items/new`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Добавить</span>
                  </Button>
                </Link>
              </div>
            }
          >
            {itemsCount === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm text-slate-500">Здесь пока ничего нет</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Link href={`/locations/${id}/scan-items`}>
                    <Button size="sm" variant="secondary">
                      <Sparkles className="h-4 w-4" />
                      По фото (ИИ)
                    </Button>
                  </Link>
                  <Link href={`/locations/${id}/items/new`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                      Добавить объект
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {location.items!.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteItem}
                    deleting={deletingItemId === item.id}
                  />
                ))}
              </div>
            )}
          </CollapsibleSection>

          {location.qrToken && (
            <CollapsibleSection
              title={
                <span className="inline-flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-primary" />
                  QR-код
                </span>
              }
              open={sections.qr}
              onOpenChange={(open) => setSection("qr", open)}
            >
              <LocationQRCode
                qrToken={location.qrToken}
                locationName={location.name}
                showLabel={false}
                embedded
              />
            </CollapsibleSection>
          )}

          <CollapsibleSection
            title={
              <span className="inline-flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                Перемещение
              </span>
            }
            open={sections.move}
            onOpenChange={(open) => setSection("move", open)}
          >
            <LocationParentSelect
              locationId={id}
              currentParentId={location.parentId}
              onMoved={() => {
                fetch(`/api/locations/${id}`)
                  .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) return null;
                    return data as StorageLocation;
                  })
                  .then((data) => data && setLocation(data));
              }}
            />
          </CollapsibleSection>
        </div>

        <div className="hidden gap-2 md:flex">
          <Link href={`/locations/${id}/edit`} className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">
              <Pencil className="h-4 w-4" />
              Редактировать
            </Button>
          </Link>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Удаление..." : "Удалить"}
          </Button>
        </div>
      </div>

      <div className="sticky-bottom-actions fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:border-slate-600 dark:bg-slate-800/95 md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Link href={`/locations/${id}/edit`} className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">
              <Pencil className="h-4 w-4" />
              Изменить
            </Button>
          </Link>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "..." : "Удалить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
