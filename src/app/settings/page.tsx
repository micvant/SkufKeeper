"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Navigation";
import { useAppTheme } from "@/components/ThemeProvider";
import { APP_THEME_IDS, APP_THEMES } from "@/lib/app-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme, saving } = useAppTheme();
  const router = useRouter();
  const [itemFieldLabel, setItemFieldLabel] = useState("");
  const [locationFieldLabel, setLocationFieldLabel] = useState("");
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [fieldsSaving, setFieldsSaving] = useState(false);
  const [fieldsMessage, setFieldsMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/settings")
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setItemFieldLabel(data.itemCustomFieldLabel ?? "");
        setLocationFieldLabel(data.locationCustomFieldLabel ?? "");
      })
      .finally(() => setFieldsLoading(false));
  }, []);

  async function handleSaveCustomFields() {
    setFieldsSaving(true);
    setFieldsMessage(null);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemCustomFieldLabel: itemFieldLabel,
          locationCustomFieldLabel: locationFieldLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сохранения");
      setItemFieldLabel(data.itemCustomFieldLabel ?? "");
      setLocationFieldLabel(data.locationCustomFieldLabel ?? "");
      setFieldsMessage("Сохранено");
    } catch (err) {
      setFieldsMessage(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setFieldsSaving(false);
    }
  }

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

        <section>
          <h2 className="text-sm font-medium text-slate-700">Свои поля</h2>
          <p className="mt-1 text-xs text-slate-500">
            Задайте название дополнительного поля — оно появится в формах объектов и мест хранения
          </p>
          {fieldsLoading ? (
            <p className="mt-3 text-sm text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-3 space-y-3">
              <Input
                label="Поле для объектов"
                placeholder="Например: Серийный номер"
                value={itemFieldLabel}
                onChange={(e) => setItemFieldLabel(e.target.value)}
              />
              <Input
                label="Поле для мест хранения"
                placeholder="Например: Адрес или комната"
                value={locationFieldLabel}
                onChange={(e) => setLocationFieldLabel(e.target.value)}
              />
              {fieldsMessage && (
                <p
                  className={cn(
                    "text-sm",
                    fieldsMessage === "Сохранено" ? "text-primary" : "text-red-600"
                  )}
                >
                  {fieldsMessage}
                </p>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveCustomFields}
                disabled={fieldsSaving}
              >
                {fieldsSaving ? "Сохранение..." : "Сохранить поля"}
              </Button>
            </div>
          )}
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
