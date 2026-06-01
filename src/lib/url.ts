export const QR_SCHEME = "skufkeeper";

export function getQrPayload(qrToken: string): string {
  return `${QR_SCHEME}:l/${qrToken}`;
}

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

function normalizeScanText(text: string): string {
  try {
    return decodeURIComponent(text.trim().replace(/^\uFEFF/, ""));
  } catch {
    return text.trim().replace(/^\uFEFF/, "");
  }
}

function extractTokenFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/l\/([a-f0-9]+)$/i);
  return match ? match[1] : null;
}

export function getScanToken(text: string): string | null {
  const trimmed = normalizeScanText(text);
  if (!trimmed) return null;

  const schemeMatch = trimmed.match(/^skufkeeper:l\/([a-f0-9]+)$/i);
  if (schemeMatch) return schemeMatch[1];

  if (/^[a-f0-9]{16}$/i.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    return extractTokenFromPath(url.pathname);
  } catch {
    if (/^\/l\/[a-f0-9]+$/i.test(trimmed)) {
      return trimmed.split("/").pop() ?? null;
    }
    const tokenMatch = trimmed.match(/\/l\/([a-f0-9]+)/i);
    if (tokenMatch) return tokenMatch[1];
    const schemeInline = trimmed.match(/skufkeeper:l\/([a-f0-9]+)/i);
    if (schemeInline) return schemeInline[1];
  }

  return null;
}

/** Returns app path like /l/abc123 or /locations/clxyz */
export function getScanPath(text: string): string | null {
  const token = getScanToken(text);
  if (token) return `/l/${token}`;

  const trimmed = normalizeScanText(text);

  try {
    const url = new URL(trimmed);
    const locMatch = url.pathname.match(/^\/locations\/([a-z0-9]+)$/i);
    if (locMatch) return `/locations/${locMatch[1]}`;
  } catch {
    const pathMatch = trimmed.match(/\/locations\/([a-z0-9]+)/i);
    if (pathMatch) return `/locations/${pathMatch[1]}`;
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
