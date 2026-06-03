const CACHE_PREFIX = "skufkeeper-cache-v1:";

export function cacheJson<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    CACHE_PREFIX + key,
    JSON.stringify({ data, cachedAt: new Date().toISOString() })
  );
}

export function getCachedJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return (JSON.parse(raw) as { data: T }).data;
  } catch {
    return null;
  }
}

export function locationCacheKey(id: string) {
  return `location:${id}`;
}

export function locationsListCacheKey() {
  return "locations:all";
}
