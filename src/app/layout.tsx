import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SwipeBackHandler } from "@/components/SwipeBackHandler";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { getCurrentUserId } from "@/lib/auth";
import { DEFAULT_APP_THEME, parseAppTheme } from "@/lib/app-theme";
import { DEFAULT_COLOR_SCHEME, parseColorScheme } from "@/lib/color-scheme";
import { OfflineSyncProvider } from "@/components/OfflineSyncProvider";
import { ThemeBootstrap } from "@/components/ThemeBootstrap";
import { OfflineAwareLayout } from "@/components/OfflineAwareLayout";
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
  let initialColorScheme = DEFAULT_COLOR_SCHEME;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { appTheme: true, appColorScheme: true },
    });
    initialTheme = parseAppTheme(user?.appTheme);
    initialColorScheme = parseColorScheme(user?.appColorScheme);
  }

  return (
    <html
      lang="ru"
      data-app-theme={initialTheme}
      data-color-scheme="light"
      suppressHydrationWarning
    >
      <head>
        <ThemeBootstrap />
      </head>
      <body className="min-h-dvh overflow-x-hidden">
        <ThemeProvider initialTheme={initialTheme} initialColorScheme={initialColorScheme}>
          <OfflineSyncProvider>
            <OfflineAwareLayout>
              <SwipeBackHandler />
              <ServiceWorkerRegister />
              <div className="flex min-h-dvh min-w-0 w-full max-w-full overflow-x-hidden">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
                  <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
                </div>
              </div>
            </OfflineAwareLayout>
          </OfflineSyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
