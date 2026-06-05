import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth";
import { AI_MAX_PHOTOS } from "@/lib/ai-constants";
import { asVisionUpload, type VisionUpload } from "@/lib/ai-recognize-shared";
import { isAiRecognizeConfigured, recognizeItemsFromFiles } from "@/lib/ai-recognize";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function collectPhotos(formData: FormData): VisionUpload[] {
  const files: VisionUpload[] = [];
  for (const entry of formData.getAll("photos")) {
    const blob = asVisionUpload(entry);
    if (blob) files.push(blob);
  }
  if (files.length > 0) return files;

  const single = asVisionUpload(formData.get("photo"));
  if (single) return [single];
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getRequestUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
    }

    if (!isAiRecognizeConfigured()) {
      return NextResponse.json(
        {
          error: "Распознавание по фото временно недоступно.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const files = collectPhotos(formData).slice(0, AI_MAX_PHOTOS);

    if (files.length === 0) {
      return NextResponse.json({ error: "Загрузите хотя бы одно фото" }, { status: 400 });
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Файл слишком большой (максимум 10 МБ)" }, { status: 400 });
      }
      const mime = file.type || "";
      const fileName = "name" in file && typeof file.name === "string" ? file.name : "";
      const okType =
        ALLOWED_TYPES.includes(mime) ||
        Boolean(fileName.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i));
      if (!okType) {
        return NextResponse.json({ error: "Неподдерживаемый формат изображения" }, { status: 400 });
      }
    }

    const items = await recognizeItemsFromFiles(files);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка распознавания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
