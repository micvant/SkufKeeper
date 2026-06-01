export function getLocationUrl(locationId: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/locations/${locationId}`;
}

export function getClientBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export function extractLocationId(text: string): string | null {
  const trimmed = text.trim();

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/locations\/([a-z0-9]+)/i);
    if (match) return match[1];
  } catch {
    // not a full URL
  }

  const pathMatch = trimmed.match(/\/locations\/([a-z0-9]+)/i);
  if (pathMatch) return pathMatch[1];

  if (/^[a-z0-9]{20,}$/i.test(trimmed)) return trimmed;

  return null;
}
