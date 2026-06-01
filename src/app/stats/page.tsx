"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Package, FolderTree, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Header } from "@/components/Navigation";
import { LocationTreeView } from "@/components/LocationTreeView";
import { Button } from "@/components/ui/Button";
import { collectExpandableIds } from "@/lib/location-tree";
import type { StatsResponse } from "@/types";

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data: StatsResponse) => {
        setStats(data);
        setExpanded(collectExpandableIds(data.tree));
      })
      .finally(() => setLoading(false));
  }, []);

  function toggleNode(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    if (stats) setExpanded(collectExpandableIds(stats.tree));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  return (
    <div>
      <Header title="Статистика" backHref="/" />

      <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-none md:px-8">
        {loading ? (
          <p className="text-center text-slate-500">Загрузка...</p>
        ) : stats ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={MapPin} label="Мест хранения" value={stats.totalLocations} />
              <StatCard icon={FolderTree} label="Корневых" value={stats.rootLocations} />
              <StatCard icon={Package} label="Объектов" value={stats.totalItems} />
              <StatCard icon={Package} label="Всего штук" value={stats.totalItemQuantity} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Структура хранения</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" type="button" onClick={expandAll}>
                    <ChevronsUpDown className="h-4 w-4" />
                    Развернуть все
                  </Button>
                  <Button variant="secondary" size="sm" type="button" onClick={collapseAll}>
                    <ChevronsDownUp className="h-4 w-4" />
                    Свернуть все
                  </Button>
                </div>
              </div>
              <LocationTreeView
                nodes={stats.tree}
                expanded={expanded}
                onToggle={toggleNode}
              />
            </div>
          </>
        ) : (
          <p className="text-center text-slate-500">Не удалось загрузить статистику</p>
        )}

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-emerald-600 hover:text-emerald-700"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <Icon className="h-5 w-5 text-emerald-600" />
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
