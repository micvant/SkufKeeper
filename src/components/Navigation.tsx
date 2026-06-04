"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  ChevronLeft,
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const menuPanel =
    open && mounted ? (
      <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true">
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label="Закрыть меню"
          onClick={() => setOpen(false)}
        />
        <nav className="absolute right-0 top-0 bottom-0 flex w-[min(85vw,300px)] flex-col bg-white shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
          <ul className="min-h-0 flex-1 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {mobileNavItems.map(({ href, icon: Icon, label }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href} className="mb-1">
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                      active
                        ? "bg-primary-light text-primary-foreground"
                        : "text-slate-800 hover:bg-slate-100"
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
    ) : null;

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
      {mounted && menuPanel ? createPortal(menuPanel, document.body) : null}
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
                  ? "bg-primary-light text-primary-foreground"
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
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden border-b border-slate-200 bg-white/90 backdrop-blur-lg safe-top md:border-b">
      <div className="mx-auto flex w-full min-w-0 max-w-3xl items-center gap-2 px-4 py-3 md:max-w-none md:px-8">
        {backHref && (
          <Link
            href={backHref}
            className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 md:hidden"
            aria-label="Назад"
          >
            <ChevronLeft className="h-7 w-7" strokeWidth={2} />
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
