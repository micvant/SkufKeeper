import type { RecognizedItem, VisionUpload } from "@/lib/ai-recognize-shared";
import { recognizeItemsFromFiles as recognizeWithGemini, isGeminiConfigured } from "@/lib/gemini-vision";
import { isYandexGptConfigured, recognizeItemsWithYandex } from "@/lib/yandex-gpt-vision";

export type AiProvider = "yandex" | "gemini";

export function resolveAiProvider(): AiProvider | null {
  const forced = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (forced === "yandex") return isYandexGptConfigured() ? "yandex" : null;
  if (forced === "gemini") return isGeminiConfigured() ? "gemini" : null;

  if (isYandexGptConfigured()) return "yandex";
  if (isGeminiConfigured()) return "gemini";
  return null;
}

export function isAiRecognizeConfigured(): boolean {
  return resolveAiProvider() !== null;
}

export async function recognizeItemsFromFiles(files: VisionUpload[]): Promise<RecognizedItem[]> {
  const provider = resolveAiProvider();
  if (!provider) {
    throw new Error("Распознавание по фото не настроено.");
  }
  if (provider === "yandex") return recognizeItemsWithYandex(files);
  return recognizeWithGemini(files);
}
