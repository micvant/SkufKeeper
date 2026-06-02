import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth-cookie";

export { getSessionCookieName, getSessionCookieOptions } from "@/lib/auth-cookie";

function getSecretKey() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-only-change-me";
}

export async function createSessionToken(userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ sub: userId, exp: now + SESSION_MAX_AGE, iat: now });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = createHmac("sha256", getSecretKey()).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

async function verifySessionToken(token: string): Promise<string | null> {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = createHmac("sha256", getSecretKey()).update(encodedPayload).digest("base64url");
  if (signature.length !== expected.length) return null;
  const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return null;

  const payloadRaw = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const payload = JSON.parse(payloadRaw) as { sub?: string; exp?: number };
  if (!payload.sub || typeof payload.exp !== "number") return null;
  if (Math.floor(Date.now() / 1000) >= payload.exp) return null;
  return payload.sub;
}

export async function getRequestUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hash: string) {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(storedHash));
}
