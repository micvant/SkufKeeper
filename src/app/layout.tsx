import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getCurrentUserId } from "@/lib/auth";
import { DEFAULT_APP_THEME, parseAppTheme } from "@/lib/app-theme";
import { prisma } from "@/lib/prisma";

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
  viewportFit: "cover",
  themeColor: "#5c4033",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  let initialTheme = DEFAULT_APP_THEME;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { appTheme: true },
    });
    initialTheme = parseAppTheme(user?.appTheme);
  }

  return (
    <html lang="ru" data-app-theme={initialTheme} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider initialTheme={initialTheme}>
          <div className="flex min-h-dvh">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
