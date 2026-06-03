const DB_KEY = "skufkeeper-offline-v1";

export type OfflineLocationPayload = {
  id: string;
  qrToken: string;
  name: string;
  cachedAt?: string;
  htmlPath?: string;
};

export type OfflineQrPayload = {
  token: string;
  locationId: string;
  cachedAt: string;
};

type OfflineStore = {
  locations: Record<string, OfflineLocationPayload>;
  qrByToken: Record<string, OfflineQrPayload>;
};

function readStore(): OfflineStore {
  if (typeof window === "undefined") {
    return { locations: {}, qrByToken: {} };
  }
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return { locations: {}, qrByToken: {} };
    return JSON.parse(raw) as OfflineStore;
  } catch {
    return { locations: {}, qrByToken: {} };
  }
}

function writeStore(store: OfflineStore) {
  localStorage.setItem(DB_KEY, JSON.stringify(store));
}

export function cacheLocationForOffline(payload: OfflineLocationPayload) {
  const store = readStore();
  store.locations[payload.id] = { ...payload, cachedAt: new Date().toISOString() };
  writeStore(store);
}

export function cacheQrTokenForOffline(token: string, locationId: string) {
  const store = readStore();
  store.qrByToken[token] = {
    token,
    locationId,
    cachedAt: new Date().toISOString(),
  };
  writeStore(store);
}

export function getOfflineLocationByQrToken(token: string): OfflineQrPayload | null {
  return readStore().qrByToken[token] ?? null;
}

export function getOfflineLocationById(id: string): OfflineLocationPayload | null {
  return readStore().locations[id] ?? null;
}
