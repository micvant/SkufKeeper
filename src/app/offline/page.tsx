import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Header } from "@/components/Navigation";

export default function OfflinePage() {
  return (
    <div>
      <Header title="Нет сети" backHref="/" />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <WifiOff className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-lg font-semibold text-slate-800">Офлайн-режим</h2>
        <p className="mt-2 text-sm text-slate-500">
          Откройте места, которые вы уже просматривали онлайн — они сохранены на устройстве.
          QR-коды, отсканированные ранее, тоже могут открыться без интернета.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
