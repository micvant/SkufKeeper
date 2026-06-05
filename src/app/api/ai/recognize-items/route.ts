import { NextRequest, NextResponse } from "next/server";
import { getRequestUserId } from "@/lib/auth";
import { AI_MAX_PHOTOS } from "@/lib/ai-constants";
import { isAiRecognizeConfigured, recognizeItemsFromFiles, resolveAiProvider } from "@/lib/ai-recognize";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function collectPhotos(formData: FormData): File[] {
  const fromArray = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (fromArray.length > 0) return fromArray;

  const single = formData.get("photo");
  if (single instanceof File && single.size > 0) return [single];
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
          error:
            "Распознавание не настроено. Для России: YANDEX_API_KEY и YANDEX_FOLDER_ID (Yandex Cloud). Или GEMINI_API_KEY.",
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
      const okType =
        ALLOWED_TYPES.includes(file.type) || Boolean(file.name.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i));
      if (!okType) {
        return NextResponse.json({ error: "Неподдерживаемый формат изображения" }, { status: 400 });
      }
    }

    const items = await recognizeItemsFromFiles(files);
    const provider = resolveAiProvider();
    return NextResponse.json({ items, provider });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка распознавания";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
