export function getQrScanUrl(qrToken: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/l/${qrToken}`;
}

export function getLocationUrl(locationId: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/locations/${locationId}`;
}

export function getClientBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

/** Returns app path like /l/abc123 or /locations/clxyz */
export function getScanPath(text: string): string | null {
  const trimmed = text.trim();

  try {
    const url = new URL(trimmed);
    if (/^\/l\/[a-f0-9]+$/i.test(url.pathname)) return url.pathname;
    if (/^\/locations\/[a-z0-9]+$/i.test(url.pathname)) return url.pathname;
  } catch {
    if (/^\/l\/[a-f0-9]+$/i.test(trimmed)) return trimmed;
    const pathMatch = trimmed.match(/\/locations\/([a-z0-9]+)/i);
    if (pathMatch) return `/locations/${pathMatch[1]}`;
    const tokenMatch = trimmed.match(/\/l\/([a-f0-9]+)/i);
    if (tokenMatch) return `/l/${tokenMatch[1]}`;
  }

  return null;
}

/** @deprecated use getScanPath */
export function extractLocationId(text: string): string | null {
  const path = getScanPath(text);
  if (!path) return null;
  const idMatch = path.match(/\/locations\/([a-z0-9]+)/i);
  return idMatch?.[1] ?? null;
}
