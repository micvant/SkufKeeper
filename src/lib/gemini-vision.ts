import { AI_MAX_PHOTOS } from "@/lib/ai-constants";
import {
  parseRecognizedPayload,
  prepareImageForVision,
  RECOGNIZE_PROMPT,
  type RecognizedItem,
  type VisionUpload,
} from "@/lib/ai-recognize-shared";

const DEFAULT_MODEL = "gemini-2.0-flash";

export type { RecognizedItem };

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function recognizeItemsFromFiles(files: VisionUpload[]): Promise<RecognizedItem[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY не задан. Добавьте ключ в переменные окружения.");
  }

  const images = files.slice(0, AI_MAX_PHOTOS);
  if (images.length === 0) {
    throw new Error("Добавьте хотя бы одно фото");
  }

  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
    { text: RECOGNIZE_PROMPT },
  ];

  for (const file of images) {
    const prepared = await prepareImageForVision(file);
    parts.push({ inline_data: { mime_type: prepared.mimeType, data: prepared.base64 } });
  }

  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  if (!res.ok) {
    const msg = data.error?.message || `Ошибка Gemini (${res.status})`;
    throw new Error(msg);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("") ?? "";
  if (!text) {
    throw new Error("Пустой ответ от модели");
  }

  return parseRecognizedPayload(text);
}
