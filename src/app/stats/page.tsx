"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Package, FolderTree, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Header } from "@/components/Navigation";
import { LocationTreeView } from "@/components/LocationTreeView";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Button } from "@/components/ui/Button";
import { collectExpandableIds } from "@/lib/location-tree";
import type { StatsResponse } from "@/types";

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [structureOpen, setStructureOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data: StatsResponse) => {
        setStats(data);
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
    if (stats) {
      setExpanded(collectExpandableIds(stats.tree));
      setStructureOpen(true);
    }
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <Header title="Статистика" backHref="/" />

      <div className="mx-auto w-full min-w-0 max-w-3xl px-4 py-6 md:max-w-none md:px-8">
        {loading ? (
          <p className="text-center text-slate-500">Загрузка...</p>
        ) : stats ? (
          <>
            <CollapsibleSection
              title="Сводка"
              open={summaryOpen}
              onOpenChange={setSummaryOpen}
              className="mb-3"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard icon={MapPin} label="Мест хранения" value={stats.totalLocations} />
                <StatCard icon={FolderTree} label="Корневых" value={stats.rootLocations} />
                <StatCard icon={Package} label="Объектов" value={stats.totalItems} />
                <StatCard icon={Package} label="Всего штук" value={stats.totalItemQuantity} />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Структура хранения"
              open={structureOpen}
              onOpenChange={setStructureOpen}
              actions={
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" type="button" onClick={expandAll}>
                    <ChevronsUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Развернуть</span>
                  </Button>
                  <Button variant="secondary" size="sm" type="button" onClick={collapseAll}>
                    <ChevronsDownUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Свернуть</span>
                  </Button>
                </div>
              }
            >
              <LocationTreeView
                nodes={stats.tree}
                expanded={expanded}
                onToggle={toggleNode}
              />
            </CollapsibleSection>
          </>
        ) : (
          <p className="text-center text-slate-500">Не удалось загрузить статистику</p>
        )}

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-primary hover:text-primary-hover"
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
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
