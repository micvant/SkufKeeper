import type { RecognizedItem } from "@/lib/ai-recognize-shared";
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

export function getAiProviderLabel(provider: AiProvider): string {
  return provider === "yandex" ? "Yandex GPT" : "Google Gemini";
}

export async function recognizeItemsFromFiles(files: File[]): Promise<RecognizedItem[]> {
  const provider = resolveAiProvider();
  if (!provider) {
    throw new Error(
      "Распознавание не настроено. Задайте YANDEX_API_KEY и YANDEX_FOLDER_ID (РФ) или GEMINI_API_KEY."
    );
  }
  if (provider === "yandex") return recognizeItemsWithYandex(files);
  return recognizeWithGemini(files);
}
