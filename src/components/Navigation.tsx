"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, QrCode, BarChart3, ScanLine, Settings } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Главная" },
  { href: "/stats", icon: BarChart3, label: "Статистика" },
  { href: "/search", icon: Search, label: "Поиск" },
  { href: "/scan", icon: ScanLine, label: "Сканер" },
  { href: "/locations/new", icon: Plus, label: "Добавить" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/locations/new") return pathname === "/locations/new";
  if (href === "/settings") return pathname === "/settings";
  return pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 backdrop-blur-lg safe-bottom md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1 text-[9px] font-medium transition-colors sm:text-[10px]",
                active ? "text-primary" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5]")} />
              <span className="truncate">{label}</span>
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
    { href: "/stats", icon: BarChart3, label: "Статистика" },
    { href: "/search", icon: Search, label: "Поиск" },
    { href: "/qr-codes", icon: QrCode, label: "QR-коды" },
    { href: "/scan", icon: ScanLine, label: "Сканер QR" },
    { href: "/locations/new", icon: Plus, label: "Новое место" },
    { href: "/settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-5">
        <AppLogo size={40} />
        <div>
          <h1 className="font-bold text-slate-900">SkufKeeper</h1>
          <p className="text-xs text-slate-500">Инвентаризация</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {links.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-light text-primary"
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
