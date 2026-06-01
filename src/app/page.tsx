import Link from "next/link";
import { MapPin, Plus, Search, BarChart3 } from "lucide-react";
import { LocationCard } from "@/components/Cards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allLocations, totalItems] = await Promise.all([
    prisma.storageLocation.findMany({
      include: { _count: { select: { items: true, children: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.item.count(),
  ]);

  const locationById = new Map(allLocations.map((loc) => [loc.id, loc]));
  const childrenByParent = new Map<string, string[]>();

  for (const loc of allLocations) {
    if (!loc.parentId) continue;
    const list = childrenByParent.get(loc.parentId) ?? [];
    list.push(loc.id);
    childrenByParent.set(loc.parentId, list);
  }

  const aggregateCache = new Map<string, { nestedLocations: number; totalItems: number }>();
  const aggregate = (id: string): { nestedLocations: number; totalItems: number } => {
    const cached = aggregateCache.get(id);
    if (cached) return cached;

    const current = locationById.get(id);
    if (!current) return { nestedLocations: 0, totalItems: 0 };

    const children = childrenByParent.get(id) ?? [];
    let nestedLocations = 0;
    let totalItemsInBranch = current._count.items;

    for (const childId of children) {
      const childAgg = aggregate(childId);
      nestedLocations += 1 + childAgg.nestedLocations;
      totalItemsInBranch += childAgg.totalItems;
    }

    const result = { nestedLocations, totalItems: totalItemsInBranch };
    aggregateCache.set(id, result);
    return result;
  };

  const rootLocations = allLocations
    .filter((loc) => !loc.parentId)
    .map((root) => {
      const agg = aggregate(root.id);
      return {
        ...root,
        _count: {
          items: agg.totalItems,
          children: agg.nestedLocations,
        },
      };
    });

  const totalLocations = allLocations.length;

  return (
    <div>
      <div className="border-b border-slate-200 bg-white px-4 py-4 safe-top md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
            SK
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">SkufKeeper</h1>
            <p className="text-sm text-slate-500">
              {totalLocations} {totalLocations === 1 ? "место" : "мест"} · {totalItems} объектов
            </p>
          </div>
        </div>
      </div>

      <div className="hidden border-b border-slate-200 bg-white px-8 py-6 md:block">
        <h1 className="text-2xl font-bold text-slate-900">Места хранения</h1>
        <p className="mt-1 text-slate-500">
          {totalLocations} {totalLocations === 1 ? "место" : "мест"} · {totalItems} объектов
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 md:max-w-none md:px-8">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Link
            href="/locations/new"
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Новое место</span>
          </Link>
          <Link
            href="/stats"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 transition-colors hover:bg-slate-50"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">Статистика</span>
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Search className="h-5 w-5" />
            <span className="text-sm font-medium">Поиск</span>
          </Link>
        </div>

        {rootLocations.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-700">Пока нет мест хранения</h2>
            <p className="mt-2 text-sm text-slate-500">
              Создайте первое место — шкаф, ящик с инструментами или полку
            </p>
            <Link
              href="/locations/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Добавить место
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rootLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
