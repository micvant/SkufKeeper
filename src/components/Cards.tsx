import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { EntityIcon } from "@/components/EntityIcon";
import { DEFAULT_ITEM_ICON, DEFAULT_LOCATION_ICON } from "@/lib/icons";
import type { StorageLocation } from "@/types";

interface LocationCardProps {
  location: StorageLocation;
  /** Компактная строка — для списков на телефоне */
  compact?: boolean;
}

function LocationThumb({
  location,
  size = "md",
}: {
  location: StorageLocation;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-10 w-10 rounded-lg" : "h-11 w-11 rounded-xl";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={`relative shrink-0 overflow-hidden bg-slate-100 ${box}`}>
      {location.photoPath ? (
        <Image
          src={location.photoPath}
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <EntityIcon
          iconName={location.iconName}
          fallback={DEFAULT_LOCATION_ICON}
          className="h-full w-full bg-emerald-50"
          iconClassName={`${icon} text-emerald-600`}
        />
      )}
    </div>
  );
}

export function LocationCard({ location, compact = false }: LocationCardProps) {
  const itemCount = location._count?.items ?? 0;
  const childCount = location._count?.children ?? 0;
  const meta = [
    `${itemCount} ${getItemWord(itemCount)}`,
    childCount > 0 ? `${childCount} влож.` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  if (compact) {
    return (
      <Link
        href={`/locations/${location.id}`}
        className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-all hover:border-emerald-300 active:scale-[0.99]"
      >
        <LocationThumb location={location} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
            {location.name}
          </h3>
          <p className="truncate text-xs text-slate-500">{meta}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-emerald-500" />
      </Link>
    );
  }

  return (
    <Link
      href={`/locations/${location.id}`}
      className="group flex gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md active:scale-[0.99]"
    >
      <LocationThumb location={location} size="md" />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">
          {location.name}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">{meta}</p>
        {location.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{location.description}</p>
        )}
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 group-hover:text-emerald-500" />
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
    iconName?: string | null;
    quantity?: number;
    location?: { id: string; name: string };
  };
  showLocation?: boolean;
  onDelete?: (id: string, name: string) => void;
  deleting?: boolean;
}

export function ItemCard({ item, showLocation = false, onDelete, deleting }: ItemCardProps) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/items/${item.id}`}
        className="group flex min-w-0 flex-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md active:scale-[0.99]"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {item.photoPath ? (
            <Image src={item.photoPath} alt={item.name} fill className="object-cover" unoptimized />
          ) : (
            <EntityIcon
              iconName={item.iconName}
              fallback={DEFAULT_ITEM_ICON}
              className="h-full w-full"
              iconClassName="h-6 w-6 text-emerald-500"
            />
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
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(item.id, item.name)}
          disabled={deleting}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          aria-label={`Удалить ${item.name}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
