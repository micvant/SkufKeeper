"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Plus,
  QrCode,
  BarChart3,
  ScanLine,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/", icon: Home, label: "Главная" },
  { href: "/stats", icon: BarChart3, label: "Статистика" },
  { href: "/search", icon: Search, label: "Поиск" },
  { href: "/qr-codes", icon: QrCode, label: "QR-коды" },
  { href: "/scan", icon: ScanLine, label: "Сканер" },
  { href: "/locations/new", icon: Plus, label: "Добавить место" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/locations/new") return pathname === "/locations/new";
  if (href === "/settings") return pathname === "/settings";
  return pathname.startsWith(href);
}

export function BurgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
        aria-label="Открыть меню"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-white shadow-xl safe-top safe-bottom">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <AppLogo size={32} />
                <span className="font-bold text-slate-900">SkufKeeper</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-3">
              {mobileNavItems.map(({ href, icon: Icon, label }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-light text-primary"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-lg safe-top md:border-b">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 md:max-w-none md:px-8">
        {backHref && (
          <Link
            href={backHref}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
          >
            ←
          </Link>
        )}
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">{title}</h1>
        <div className="md:hidden">
          <BurgerMenu />
        </div>
      </div>
    </header>
  );
}
