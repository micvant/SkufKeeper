import Link from "next/link";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { ItemCard } from "@/components/Cards";
import type { Item } from "@/types";

interface HomeAlertsProps {
  lowStock: Item[];
  expiringSoon: Item[];
}

export function HomeAlerts({ lowStock, expiringSoon }: HomeAlertsProps) {
  if (lowStock.length === 0 && expiringSoon.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {lowStock.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Заканчивается
            </h2>
            <Link href="/search?lowStock=1" className="text-xs text-primary">
              Все
            </Link>
          </div>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map((item) => (
              <ItemCard key={item.id} item={item} showLocation />
            ))}
          </div>
        </section>
      )}

      {expiringSoon.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-orange-700">
              <CalendarClock className="h-4 w-4" />
              Срок годности
            </h2>
            <Link href="/search?expiring=30" className="text-xs text-primary">
              Все
            </Link>
          </div>
          <div className="space-y-2">
            {expiringSoon.slice(0, 5).map((item) => (
              <ItemCard key={item.id} item={item} showLocation />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
