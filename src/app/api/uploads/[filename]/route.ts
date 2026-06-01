import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getUploadDir, UPLOAD_MIME_TYPES } from "@/lib/upload";

type Params = { params: Promise<{ filename: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { filename } = await params;

  if (!filename || filename.includes("..") || !/^[\da-f-]+\.(jpe?g|png|webp|gif|heic|heif)$/i.test(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filepath = path.join(getUploadDir(), filename);

  try {
    const data = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();

    return new NextResponse(data, {
      headers: {
        "Content-Type": UPLOAD_MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
