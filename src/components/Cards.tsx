import Image from "next/image";
import Link from "next/link";
import { Package, MapPin } from "lucide-react";
import type { StorageLocation } from "@/types";

interface LocationCardProps {
  location: StorageLocation;
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Link
      href={`/locations/${location.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200">
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
        <div className="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {location._count?.items ?? 0} {getItemWord(location._count?.items ?? 0)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">
          {location.name}
        </h3>
        {location.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{location.description}</p>
        )}
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
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
