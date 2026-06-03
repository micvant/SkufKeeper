"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/Navigation";
import { ItemCard } from "@/components/Cards";
import { Input } from "@/components/ui/Input";
import { ITEM_UNIT_IDS, ITEM_UNITS } from "@/lib/item-units";
import type { Item, StorageLocation } from "@/types";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [locationId, setLocationId] = useState("");
  const [unit, setUnit] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [expiringDays, setExpiringDays] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [results, setResults] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/locations?all=true")
      .then((r) => r.json())
      .then(setLocations);
  }, []);

  useEffect(() => {
    if (searchParams.get("lowStock") === "1") {
      setLowStock(true);
      setShowFilters(true);
    }
    const exp = searchParams.get("expiring");
    if (exp) {
      setExpiringDays(Number(exp) || 30);
      setShowFilters(true);
    }
  }, [searchParams]);

  const handleSearch = useCallback(async () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (locationId) params.set("locationId", locationId);
    if (unit) params.set("unit", unit);
    if (lowStock) params.set("lowStock", "1");
    if (expiringDays > 0) params.set("expiringDays", String(expiringDays));

    if ([...params.keys()].length === 0) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/items?${params}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [query, locationId, unit, lowStock, expiringDays]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("lowStock") === "1" || searchParams.get("expiring")) {
      handleSearch();
    }
  }, [searchParams, handleSearch]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(), 300);
  }

  return (
    <div>
      <Header title="Поиск" backHref="/" />

      <div className="mx-auto max-w-lg px-4 py-6 md:max-w-none md:px-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Название, описание, доп. поля…"
            value={query}
            onChange={handleChange}
            className="pl-11"
            autoFocus
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
        </button>

        {showFilters && (
          <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Место</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Все места</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Единица</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Любая</option>
                {ITEM_UNIT_IDS.map((id) => (
                  <option key={id} value={id}>
                    {ITEM_UNITS[id].label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={lowStock}
                onChange={(e) => setLowStock(e.target.checked)}
                className="rounded border-slate-300"
              />
              Только с низким остатком
            </label>
            <div>
              <label className="text-sm font-medium text-slate-700">Срок годности</label>
              <select
                value={expiringDays}
                onChange={(e) => setExpiringDays(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value={0}>Не фильтровать</option>
                <option value={7}>Истекает в 7 дней</option>
                <option value={30}>Истекает в 30 дней</option>
                <option value={90}>Истекает в 90 дней</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white"
            >
              Применить фильтры
            </button>
          </div>
        )}

        <div className="mt-6">
          {loading && <p className="text-center text-sm text-slate-500">Поиск...</p>}

          {!loading && searched && results.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center">
              <p className="text-slate-500">Ничего не найдено</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Найдено: {results.length}</p>
              {results.map((item) => (
                <ItemCard key={item.id} item={item} showLocation />
              ))}
            </div>
          )}

          {!searched && !loading && (
            <p className="text-center text-sm text-slate-400">
              Введите запрос или выберите фильтры
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-slate-500">Загрузка...</p>}>
      <SearchPageContent />
    </Suspense>
  );
}
