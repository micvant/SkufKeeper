import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar, BottomNav } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "SkufKeeper — Инвентаризация",
  description: "Учёт вещей и мест хранения",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SkufKeeper",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#5c4033",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-dvh">
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}
