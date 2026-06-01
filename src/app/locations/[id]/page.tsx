"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/Navigation";
import { ItemCard } from "@/components/Cards";
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
    if (!confirm("Удалить место и все объекты в нём?")) return;

    setDeleting(true);
    try {
      await fetch(`/api/locations/${id}`, { method: "DELETE" });
      router.push("/");
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

  return (
    <div>
      <Header title={location.name} backHref="/" />

      <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-none md:px-8">
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
          <LocationQRCode locationId={id} locationName={location.name} />
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
            {deleting ? "Удаление..." : "Удалить"}
          </Button>
        </div>

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
