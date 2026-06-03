"use client";

import { Header } from "@/components/Navigation";
import { useAppTheme } from "@/components/ThemeProvider";
import { APP_THEME_IDS, APP_THEMES } from "@/lib/app-theme";
import { COLOR_SCHEME_IDS, COLOR_SCHEMES } from "@/lib/color-scheme";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CustomFieldDefinitionsEditor } from "@/components/CustomFieldDefinitionsEditor";
import { BackupSettings } from "@/components/BackupSettings";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, colorScheme, setTheme, setColorScheme, saving } = useAppTheme();

  const schemeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  } as const;
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
          <h2 className="text-sm font-medium text-slate-700">Тема оформления</h2>
          <p className="mt-1 text-xs text-slate-500">Светлая, тёмная или как в системе</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {COLOR_SCHEME_IDS.map((id) => {
              const Icon = schemeIcons[id];
              const selected = colorScheme === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setColorScheme(id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-colors",
                    selected
                      ? "border-primary bg-primary-light"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <Icon className={cn("h-5 w-5", selected ? "text-primary" : "text-slate-500")} />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      selected ? "text-primary" : "text-slate-700"
                    )}
                  >
                    {COLOR_SCHEMES[id].label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-slate-700">Акцентный цвет</h2>
          <p className="mt-1 text-xs text-slate-500">
            Сохраняется в вашем аккаунте и синхронизируется между устройствами
            {saving ? " · сохранение..." : ""}
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

        <CustomFieldDefinitionsEditor
          entityType="item"
          title="Доп. поля для всех объектов"
          description="Задайте поля: текст или перечисление с вариантами на выбор."
        />

        <CustomFieldDefinitionsEditor
          entityType="location"
          title="Доп. поля для всех мест хранения"
          description="Задайте поля: текст или перечисление с вариантами на выбор."
        />

        <BackupSettings />

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
