"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/Navigation";
import { EntityIcon } from "@/components/EntityIcon";
import { CustomFieldsDisplay } from "@/components/CustomFieldsDisplay";
import { DEFAULT_ITEM_ICON } from "@/lib/icons";
import { DETAIL_WIDTH, getUploadImageUrl } from "@/lib/image-url";
import { formatItemQuantity, parseItemUnit } from "@/lib/item-units";
import { Button } from "@/components/ui/Button";
import type { Item } from "@/types";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-800">{value}</p>
    </div>
  );
}

interface ItemPageClientProps {
  item: Item;
}

export function ItemPageClient({ item }: ItemPageClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [customFields, setCustomFields] = useState(item.customFields ?? []);

  useEffect(() => {
    setCustomFields(item.customFields ?? []);
  }, [item.id, item.customFields]);
  const quantityLabel = formatItemQuantity(item.quantity, parseItemUnit(item.unit));

  async function handleDelete() {
    if (!confirm("Удалить этот объект?")) return;

    setDeleting(true);
    try {
      await fetch(`/api/items/${item.id}`, { method: "DELETE" });
      router.push(item.location ? `/locations/${item.location.id}` : "/");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page-bottom-actions md:pb-6">
      <Header title={item.name} backHref={`/locations/${item.location?.id}`} />

      <div className="mx-auto max-w-lg space-y-3 px-4 py-4 md:max-w-2xl md:px-8 md:py-6">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {item.photoPath ? (
            <div className="relative aspect-[16/10] max-h-48 w-full bg-slate-100">
              <Image
                src={getUploadImageUrl(item.photoPath, DETAIL_WIDTH)!}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                priority
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                <EntityIcon
                  iconName={item.iconName}
                  fallback={DEFAULT_ITEM_ICON}
                  iconClassName="h-8 w-8 text-primary"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary">
                  {quantityLabel}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3">
            {item.photoPath && (
              <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary">
                {quantityLabel}
              </span>
            )}
            {item.location && (
              <Link
                href={`/locations/${item.location.id}`}
                className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-light hover:text-primary sm:flex-none"
              >
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{item.location.name}</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 sm:ml-0" />
              </Link>
            )}
          </div>
        </article>

        {item.description && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
            <DetailRow label="Описание" value={item.description} />
          </section>
        )}

        <CustomFieldsDisplay fields={customFields} />

        <div className="hidden gap-2 md:flex">
          <Link href={`/items/${item.id}/edit`} className="flex-1">
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

      <div className="sticky-bottom-actions fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-lg md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Link href={`/items/${item.id}/edit`} className="flex-1">
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
