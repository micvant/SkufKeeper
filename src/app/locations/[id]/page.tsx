"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FolderOpen, QrCode, Package, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/Navigation";
import { ItemCard, LocationCard } from "@/components/Cards";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { LocationQRCode } from "@/components/LocationQRCode";
import { Button } from "@/components/ui/Button";
import type { StorageLocation } from "@/types";

type SectionKey = "qr" | "children" | "items";

export default function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [location, setLocation] = useState<StorageLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    qr: false,
    children: false,
    items: false,
  });

  useEffect(() => {
    params.then(({ id: locationId }) => {
      setId(locationId);
      fetch(`/api/locations/${locationId}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) return null;
          return data as StorageLocation;
        })
        .then(setLocation)
        .finally(() => setLoading(false));
    });
  }, [params]);

  function setSection(key: SectionKey, open: boolean) {
    setSections((prev) => ({ ...prev, [key]: open }));
  }

  function expandAllSections() {
    setSections({ qr: true, children: true, items: true });
  }

  function collapseAllSections() {
    setSections({ qr: false, children: false, items: false });
  }

  async function handleDelete() {
    const hasChildren = (location?.children?.length ?? 0) > 0;
    const message = hasChildren
      ? "Удалить место, все вложенные места и объекты?"
      : "Удалить место и все объекты в нём?";
    if (!confirm(message)) return;

    setDeleting(true);
    try {
      await fetch(`/api/locations/${id}`, { method: "DELETE" });
      router.push(location?.parent ? `/locations/${location.parent.id}` : "/");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Загрузка...</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="text-slate-500">Место не найдено</p>
        <Link href="/" className="mt-4 inline-block text-emerald-600">
          На главную
        </Link>
      </div>
    );
  }

  const backHref = location.parent ? `/locations/${location.parent.id}` : "/";

  return (
    <div>
      <Header title={location.name} backHref={backHref} />

      <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-none md:px-8">
        {location.parent && (
          <Link
            href={`/locations/${location.parent.id}`}
            className="mb-4 inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
          >
            ← {location.parent.name}
          </Link>
        )}

        {location.photoPath && (
          <div className="relative mb-6 aspect-[16/10] max-w-2xl overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={location.photoPath}
              alt={location.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {location.description && (
          <p className="mb-6 text-slate-600">{location.description}</p>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Link href={`/locations/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4" />
              Редактировать
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
            {deleting ? "Удаление..." : "Удалить"}
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={expandAllSections}>
              <ChevronsUpDown className="h-4 w-4" />
              Развернуть
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={collapseAllSections}>
              <ChevronsDownUp className="h-4 w-4" />
              Свернуть
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {location.qrToken && (
            <CollapsibleSection
              title={
                <span className="inline-flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-emerald-600" />
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
                <FolderOpen className="h-4 w-4 text-emerald-600" />
                Вложенные места
              </span>
            }
            count={location.children?.length ?? 0}
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
            {location.children && location.children.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {location.children.map((child) => (
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
                <Package className="h-4 w-4 text-emerald-600" />
                Объекты
              </span>
            }
            count={location.items?.length ?? 0}
            open={sections.items}
            onOpenChange={(open) => setSection("items", open)}
            actions={
              <Link href={`/locations/${id}/items/new`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Добавить</span>
                </Button>
              </Link>
            }
          >
            {!location.items?.length ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm text-slate-500">Здесь пока ничего нет</p>
                <Link href={`/locations/${id}/items/new`} className="mt-4 inline-block">
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Добавить объект
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {location.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
