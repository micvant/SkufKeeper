"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Header } from "@/components/Navigation";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { LocationQRCode } from "@/components/LocationQRCode";
import { Input } from "@/components/ui/Input";
import type { StorageLocation } from "@/types";

export default function QrCodesPage() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/locations?all=true")
      .then((res) => res.json())
      .then(setLocations)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (loc) =>
        loc.qrToken &&
        (loc.name.toLowerCase().includes(q) || loc.qrToken.toLowerCase().includes(q))
    );
  }, [locations, query]);

  return (
    <div>
      <Header title="Все QR-коды" backHref="/" />

      <div className="mx-auto max-w-lg px-4 py-6 md:max-w-2xl md:px-8">
        <p className="mb-4 text-sm text-slate-600">
          Здесь всегда можно найти и скачать QR-код любого места — даже после смены домена.
          Коды содержат постоянный токен, не привязанный к URL сайта.
        </p>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Поиск по названию или токену..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11"
          />
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Загрузка...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500">Места не найдены</p>
        ) : (
          <div className="space-y-3">
            {filtered.filter((loc) => loc.qrToken).map((location) => (
              <CollapsibleSection
                key={location.id}
                title={location.name}
                open={expanded[location.id] ?? false}
                onOpenChange={(open) =>
                  setExpanded((prev) => ({ ...prev, [location.id]: open }))
                }
              >
                <LocationQRCode
                  qrToken={location.qrToken}
                  locationName={location.name}
                  locationId={location.id}
                  showLabel={false}
                  embedded
                />
              </CollapsibleSection>
            ))}
          </div>
        )}

        <Link
          href="/scan"
          className="mt-6 block text-center text-sm text-emerald-600 hover:text-emerald-700"
        >
          Перейти к сканеру
        </Link>
      </div>
    </div>
  );
}
