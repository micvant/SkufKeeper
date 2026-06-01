"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/Navigation";
import { ItemCard, LocationCard } from "@/components/Cards";
import { LocationQRCode } from "@/components/LocationQRCode";
import { Button } from "@/components/ui/Button";
import type { StorageLocation } from "@/types";

export default function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [location, setLocation] = useState<StorageLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then(({ id: locationId }) => {
      setId(locationId);
      fetch(`/api/locations/${locationId}`)
        .then((res) => res.json())
        .then(setLocation)
        .finally(() => setLoading(false));
    });
  }, [params]);

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
          <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl bg-slate-100">
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

        <div className="mb-6 flex flex-wrap items-start gap-2">
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
        </div>

        {location.qrToken && (
          <div className="mb-6">
            <LocationQRCode qrToken={location.qrToken} locationName={location.name} />
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FolderOpen className="h-5 w-5 text-emerald-600" />
            Вложенные места ({location.children?.length ?? 0})
          </h2>
          <Link href={`/locations/${id}/children/new`}>
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              Добавить
            </Button>
          </Link>
        </div>

        {location.children && location.children.length > 0 ? (
          <div className="mb-8 grid gap-3 sm:grid-cols-2">
            {location.children.map((child) => (
              <LocationCard key={child.id} location={child} compact />
            ))}
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
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

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Объекты ({location.items?.length ?? 0})
          </h2>
          <Link href={`/locations/${id}/items/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Добавить
            </Button>
          </Link>
        </div>

        {!location.items?.length ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
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
      </div>
    </div>
  );
}
