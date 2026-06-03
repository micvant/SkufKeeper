"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <WifiOff className="h-12 w-12 text-slate-400" />
      <h1 className="mt-4 text-lg font-semibold text-slate-900">
        {offline ? "Нет подключения к интернету" : "Что-то пошло не так"}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {offline
          ? "Откройте страницу, которую уже просматривали, или перейдите на главную — сохранённые данные на устройстве."
          : "Попробуйте обновить страницу. Если ошибка повторяется — зайдите снова позже."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white"
        >
          На главную
        </Link>
        {offline ? (
          <Link
            href="/offline"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700"
          >
            Про офлайн
          </Link>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700"
          >
            Повторить
          </button>
        )}
      </div>
    </div>
  );
}
