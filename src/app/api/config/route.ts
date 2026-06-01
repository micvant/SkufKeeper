import { NextResponse } from "next/server";
import { getPublicBaseUrl } from "@/lib/public-url";

export async function GET() {
  const baseUrl = getPublicBaseUrl();
  return NextResponse.json({ baseUrl });
}
