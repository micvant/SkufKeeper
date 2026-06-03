"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/Navigation";
import { EntityIcon } from "@/components/EntityIcon";
import { DEFAULT_ITEM_ICON } from "@/lib/icons";
import { formatItemQuantity, parseItemUnit } from "@/lib/item-units";
import { Button } from "@/components/ui/Button";
import type { Item } from "@/types";

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then(({ id: itemId }) => {
      setId(itemId);
      fetch(`/api/items/${itemId}`)
        .then((res) => res.json())
        .then(setItem)
        .finally(() => setLoading(false));
    });
  }, [params]);

  async function handleDelete() {
    if (!confirm("Удалить этот объект?")) return;

    setDeleting(true);
    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      router.push(item?.location ? `/locations/${item.location.id}` : "/");
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

  if (!item) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="text-slate-500">Объект не найден</p>
        <Link href="/" className="mt-4 inline-block text-emerald-600">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Header title={item.name} backHref={`/locations/${item.location?.id}`} />

      <div className="mx-auto max-w-lg px-4 py-6 md:px-8">
        {item.photoPath ? (
          <div className="relative mb-6 aspect-square max-w-xs overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={item.photoPath}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="mb-6 flex aspect-square max-w-xs items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
            <EntityIcon
              iconName={item.iconName}
              fallback={DEFAULT_ITEM_ICON}
              iconClassName="h-20 w-20 text-emerald-500"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">Количество</p>
            <p className="font-medium text-slate-900">
              {formatItemQuantity(item.quantity, parseItemUnit(item.unit))}
            </p>
          </div>

          {item.description && (
            <div>
              <p className="text-sm text-slate-500">Описание</p>
              <p className="text-slate-700">{item.description}</p>
            </div>
          )}

          {item.location && (
            <Link
              href={`/locations/${item.location.id}`}
              className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{item.location.name}</span>
            </Link>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href={`/items/${id}/edit`}>
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
      </div>
    </div>
  );
}
