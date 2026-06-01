"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Header } from "@/components/Navigation";
import { ItemCard } from "@/components/Cards";
import { Input } from "@/components/ui/Input";
import type { Item } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/items?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 300);
  }

  return (
    <div>
      <Header title="Поиск" backHref="/" />

      <div className="mx-auto max-w-lg px-4 py-6 md:max-w-none md:px-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Название объекта..."
            value={query}
            onChange={handleChange}
            className="pl-11"
            autoFocus
          />
        </div>

        <div className="mt-6">
          {loading && <p className="text-center text-sm text-slate-500">Поиск...</p>}

          {!loading && searched && results.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center">
              <p className="text-slate-500">Ничего не найдено по запросу «{query}»</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Найдено: {results.length}
              </p>
              {results.map((item) => (
                <ItemCard key={item.id} item={item} showLocation />
              ))}
            </div>
          )}

          {!searched && !loading && (
            <p className="text-center text-sm text-slate-400">
              Введите название объекта для поиска
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
