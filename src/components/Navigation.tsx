"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MapPin, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Главная" },
  { href: "/search", icon: Search, label: "Поиск" },
  { href: "/scan", icon: QrCode, label: "Сканер" },
  { href: "/locations/new", icon: Plus, label: "Добавить" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur-lg safe-bottom md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-colors",
                isActive ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", icon: Home, label: "Главная" },
    { href: "/search", icon: Search, label: "Поиск" },
    { href: "/scan", icon: QrCode, label: "Сканер QR" },
    { href: "/locations/new", icon: MapPin, label: "Новое место" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
          SK
        </div>
        <div>
          <h1 className="font-bold text-slate-900">SkufKeeper</h1>
          <p className="text-xs text-slate-500">Инвентаризация</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function Header({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-lg safe-top">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 md:max-w-none md:px-8">
        {backHref && (
          <Link
            href={backHref}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            ←
          </Link>
        )}
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
    </header>
  );
}
