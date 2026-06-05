import { AI_MAX_PHOTOS } from "@/lib/ai-constants";
import {
  parseRecognizedPayload,
  prepareImageForVision,
  RECOGNIZE_PROMPT,
  type RecognizedItem,
} from "@/lib/ai-recognize-shared";

const DEFAULT_BASE_URL = "https://ai.api.cloud.yandex.net/v1";
/** Мультимодальная модель в AI Studio (картинки + текст). См. «Популярные модели» → Qwen3.6 35B */
const DEFAULT_VISION_MODEL = "qwen3.6-35b-a3b";

export function getYandexVisionModel(): string {
  return process.env.YANDEX_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL;
}

export function isYandexGptConfigured(): boolean {
  return Boolean(process.env.YANDEX_API_KEY?.trim() && process.env.YANDEX_FOLDER_ID?.trim());
}

function formatModelUri(folderId: string, model: string): string {
  if (model.startsWith("gpt://") || model.startsWith("emb://")) return model;
  return `gpt://${folderId}/${model}`;
}

function extractResponseText(data: Record<string, unknown>): string {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const output = data.output;
  if (!Array.isArray(output)) return "";

  let text = "";
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const row = item as { type?: string; content?: unknown };
    if (row.type !== "message" || !Array.isArray(row.content)) continue;
    for (const part of row.content) {
      if (!part || typeof part !== "object") continue;
      const p = part as { type?: string; text?: string };
      if (p.type === "output_text" && p.text) text += p.text;
    }
  }
  return text;
}

export async function recognizeItemsWithYandex(files: File[]): Promise<RecognizedItem[]> {
  const apiKey = process.env.YANDEX_API_KEY?.trim();
  const folderId = process.env.YANDEX_FOLDER_ID?.trim();
  if (!apiKey || !folderId) {
    throw new Error("Задайте YANDEX_API_KEY и YANDEX_FOLDER_ID (Yandex Cloud / AI Studio).");
  }

  const images = files.slice(0, AI_MAX_PHOTOS);
  if (images.length === 0) {
    throw new Error("Добавьте хотя бы одно фото");
  }

  const content: Array<{ type: string; image_url?: string; text?: string }> = [];
  for (const file of images) {
    const prepared = await prepareImageForVision(file);
    content.push({
      type: "input_image",
      image_url: `data:${prepared.mimeType};base64,${prepared.base64}`,
    });
  }
  content.push({ type: "input_text", text: RECOGNIZE_PROMPT });

  const baseUrl = (process.env.YANDEX_AI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, "");
  const model = formatModelUri(folderId, getYandexVisionModel());

  const res = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "x-folder-id": folderId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: "Ты помощник для домашнего инвентаря. Отвечай только валидным JSON на русском.",
      input: [{ role: "user", content }],
      temperature: 0.2,
      max_output_tokens: 2000,
    }),
  });

  const data = (await res.json()) as Record<string, unknown> & {
    error?: { message?: string };
  };

  if (!res.ok) {
    const msg =
      (typeof data.error === "object" && data.error?.message) ||
      (typeof data.message === "string" && data.message) ||
      `Ошибка Yandex GPT (${res.status})`;
    throw new Error(msg);
  }

  const text = extractResponseText(data);
  if (!text.trim()) {
    throw new Error("Пустой ответ от Yandex GPT");
  }

  return parseRecognizedPayload(text);
}
