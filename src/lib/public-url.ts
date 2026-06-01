import os from "os";
import type { NextRequest } from "next/server";

function normalizeOrigin(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function getLanIp(): string | null {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

export function getPublicBaseUrl(request?: NextRequest, baseParam?: string | null): string {
  const fromParam = baseParam ? normalizeOrigin(baseParam) : null;
  if (fromParam) return fromParam;

  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;

  if (request) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "http";
    if (host) {
      const hostname = host.split(":")[0];
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        return `${proto}://${host}`;
      }
    }
  }

  const lanIp = getLanIp();
  const port = process.env.PORT ?? "3000";
  if (lanIp) return `http://${lanIp}:${port}`;

  return "http://localhost:3000";
}

export function isLocalhostOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
