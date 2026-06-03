import { isNetworkOnline } from "@/lib/offline-sync";

export function safeRouterRefresh(router: { refresh: () => void }): void {
  if (!isNetworkOnline()) return;
  try {
    router.refresh();
  } catch {
    /* RSC fetch may fail when offline */
  }
}
