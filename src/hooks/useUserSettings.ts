import { useEffect, useState } from "react";
import type { AppThemeId } from "@/lib/app-theme";

export interface UserSettings {
  appTheme: AppThemeId;
  itemCustomFieldLabel: string | null;
  locationCustomFieldLabel: string | null;
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/settings")
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
