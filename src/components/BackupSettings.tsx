"use client";

import { useEffect, useState } from "react";
import { Download, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";

type BackupStatus = {
  filename: string;
  at: string;
  size: number;
  count: number;
} | null;

export function BackupSettings() {
  const [status, setStatus] = useState<BackupStatus>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  async function loadStatus() {
    const res = await fetch("/api/backup/status");
    const data = await res.json();
    setStatus(data.status ?? null);
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function runBackup() {
    setRunning(true);
    setMessage("");
    try {
      const res = await fetch("/api/backup/run", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setMessage(`Сохранено: ${data.filename}`);
      await loadStatus();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section>
      <h2 className="text-sm font-medium text-slate-700">Резервная копия</h2>
      <p className="mt-1 text-xs text-slate-500">
        Экспорт данных в JSON и автокопия базы на сервере (каждые 6 часов на Railway).
      </p>

      {status && (
        <p className="mt-2 text-xs text-slate-600">
          Последний автобэкап: {new Date(status.at).toLocaleString("ru-RU")} · {status.count}{" "}
          {status.count === 1 ? "файл" : "файлов"}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <a href="/api/backup/export" download>
          <Button type="button" variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            Скачать JSON
          </Button>
        </a>
        <Button type="button" variant="secondary" className="gap-2" disabled={running} onClick={runBackup}>
          <Database className="h-4 w-4" />
          {running ? "Копирование…" : "Бэкап базы сейчас"}
        </Button>
      </div>

      {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
    </section>
  );
}
