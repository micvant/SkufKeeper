import Image from "next/image";
import Link from "next/link";
import { Package, MapPin } from "lucide-react";
import type { StorageLocation } from "@/types";

interface LocationCardProps {
  location: StorageLocation;
  compact?: boolean;
}

export function LocationCard({ location, compact = false }: LocationCardProps) {
  const itemCount = location._count?.items ?? 0;
  const childCount = location._count?.children ?? 0;

  return (
    <Link
      href={`/locations/${location.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md active:scale-[0.99]"
    >
      {!compact && (
        <div className="relative aspect-[16/11] bg-gradient-to-br from-slate-100 to-slate-200">
          {location.photoPath ? (
            <Image
              src={location.photoPath}
              alt={location.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-12 w-12 text-slate-300" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex gap-1">
            {childCount > 0 && (
              <span className="rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {childCount} влож.
              </span>
            )}
            <span className="rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {itemCount} {getItemWord(itemCount)}
            </span>
          </div>
        </div>
      )}
      <div className={compact ? "flex items-center gap-3 p-3" : "p-4"}>
        {compact && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <MapPin className="h-5 w-5 text-emerald-600" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">
            {location.name}
          </h3>
          {compact && (
            <p className="text-xs text-slate-500">
              {itemCount} {getItemWord(itemCount)}
              {childCount > 0 && ` · ${childCount} влож.`}
            </p>
          )}
          {!compact && location.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{location.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function getItemWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return "объектов";
  if (mod10 === 1) return "объект";
  if (mod10 >= 2 && mod10 <= 4) return "объекта";
  return "объектов";
}

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string | null;
    photoPath?: string | null;
    quantity?: number;
    location?: { id: string; name: string };
  };
  showLocation?: boolean;
}

export function ItemCard({ item, showLocation = false }: ItemCardProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        {item.photoPath ? (
          <Image src={item.photoPath} alt={item.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-6 w-6 text-slate-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-slate-900 group-hover:text-emerald-700">
          {item.name}
        </h3>
        {item.quantity && item.quantity > 1 && (
          <p className="text-xs text-slate-400">×{item.quantity}</p>
        )}
        {showLocation && item.location && (
          <p className="mt-0.5 truncate text-xs text-emerald-600">{item.location.name}</p>
        )}
        {item.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.description}</p>
        )}
      </div>
    </Link>
  );
}
