import Link from "next/link";
import { MapPin, Plus, Search, BarChart3 } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { BurgerMenu } from "@/components/Navigation";
import { LocationCard } from "@/components/Cards";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const [allLocations, totalItems] = await Promise.all([
    prisma.storageLocation.findMany({
      where: { userId },
      include: { _count: { select: { items: true, children: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.item.count({ where: { userId } }),
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
  const statsLine = `${totalLocations} ${totalLocations === 1 ? "место" : "мест"} · ${totalItems} объектов`;

  return (
    <div>
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-lg safe-top md:hidden">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <AppLogo size={36} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-slate-900">SkufKeeper</h1>
            <p className="truncate text-xs text-slate-500">{statsLine}</p>
          </div>
          <BurgerMenu />
        </div>
      </div>

      <div className="hidden border-b border-slate-200 bg-white px-8 py-6 md:block">
        <h1 className="text-2xl font-bold text-slate-900">Места хранения</h1>
        <p className="mt-1 text-slate-500">{statsLine}</p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-4 md:max-w-none md:px-8 md:py-6">
        <div className="mb-4 hidden flex-wrap gap-2 md:flex">
          <Link
            href="/locations/new"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-light px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-muted"
          >
            <Plus className="h-4 w-4" />
            Новое место
          </Link>
          <Link
            href="/stats"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <BarChart3 className="h-4 w-4" />
            Статистика
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Search className="h-4 w-4" />
            Поиск
          </Link>
        </div>

        {rootLocations.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center md:p-12">
            <MapPin className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-3 text-lg font-semibold text-slate-700">Пока нет мест хранения</h2>
            <p className="mt-2 text-sm text-slate-500">
              Создайте первое место — шкаф, ящик с инструментами или полку
            </p>
            <Link
              href="/locations/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" />
              Добавить место
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 md:mb-3">
              Места хранения
            </p>
            <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:grid-cols-3">
              {rootLocations.map((location) => (
                <LocationCard key={location.id} location={location} compact />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
