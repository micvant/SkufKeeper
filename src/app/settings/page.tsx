"use client";

import { Header } from "@/components/Navigation";
import { useAppTheme } from "@/components/ThemeProvider";
import { APP_THEME_IDS, APP_THEMES } from "@/lib/app-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme } = useAppTheme();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div>
      <Header title="Настройки" backHref="/" />

      <div className="mx-auto max-w-lg space-y-6 px-4 py-6 md:px-8">
        <section>
          <h2 className="text-sm font-medium text-slate-700">Цвет интерфейса</h2>
          <p className="mt-1 text-xs text-slate-500">
            Кнопки, ссылки и акценты приложения
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {APP_THEME_IDS.map((id) => {
              const t = APP_THEMES[id];
              const selected = theme === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary-light"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <span className={cn("h-6 w-6 shrink-0 rounded-full", t.swatch)} />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      selected ? "text-primary" : "text-slate-700"
                    )}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-slate-700">Аккаунт</h2>
          <p className="mt-1 text-xs text-slate-500">Выйти из текущей сессии</p>
          <Button type="button" variant="secondary" className="mt-3" onClick={handleLogout}>
            Выйти
          </Button>
        </section>
      </div>
    </div>
  );
}
