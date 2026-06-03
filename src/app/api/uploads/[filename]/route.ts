import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getUploadDir, UPLOAD_MIME_TYPES } from "@/lib/upload";
import { readOrCreateResizedImage } from "@/lib/image-process";

type Params = { params: Promise<{ filename: string }> };

const FILENAME_RE = /^[\da-f-]+\.(jpe?g|png|webp|gif|heic|heif)$/i;

export async function GET(request: NextRequest, { params }: Params) {
  const { filename } = await params;
  const widthParam = request.nextUrl.searchParams.get("w");
  const width = widthParam ? Number.parseInt(widthParam, 10) : 0;

  if (!filename || filename.includes("..") || !FILENAME_RE.test(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filepath = path.join(getUploadDir(), filename);

  try {
    if (Number.isFinite(width) && width > 0) {
      const data = await readOrCreateResizedImage(filename, width);
      return new NextResponse(new Uint8Array(data), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const data = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": UPLOAD_MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
