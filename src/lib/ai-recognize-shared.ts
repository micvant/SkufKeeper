import sharp from "sharp";

export type RecognizedItem = {
  name: string;
  quantity: number;
};

/** Blob/File из FormData на сервере (без глобального File в старых Node). */
export type VisionUpload = Blob;

export function isVisionUpload(value: FormDataEntryValue | null): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    typeof (value as Blob).arrayBuffer === "function" &&
    typeof (value as Blob).size === "number" &&
    (value as Blob).size > 0
  );
}

export function asVisionUpload(value: FormDataEntryValue | null): VisionUpload | null {
  return isVisionUpload(value) ? (value as VisionUpload) : null;
}

export const RECOGNIZE_PROMPT = `На фотографиях предметы домашнего инвентаря (инструменты, посуда, продукты, техника, расходники).
Перечисли отдельные физические предметы, которые можно учесть на складе.
Ответ строго в JSON без markdown:
{"items":[{"name":"краткое название на русском","quantity":число}]}
Правила:
- только реально видимые отдельные предметы;
- quantity >= 1, целое если штуки;
- без дублей внутри ответа;
- если предметов нет — {"items":[]};
- не добавляй комментарии вне JSON.`;

export async function prepareImageForVision(file: VisionUpload): Promise<{ mimeType: string; base64: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const out = await sharp(buffer)
    .rotate()
    .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  return { mimeType: "image/jpeg", base64: out.toString("base64") };
}

export function parseRecognizedPayload(raw: string): RecognizedItem[] {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();

  const parsed = JSON.parse(text) as { items?: unknown };
  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error("Некорректный ответ модели");
  }

  const items: RecognizedItem[] = [];
  const seen = new Set<string>();

  for (const entry of parsed.items) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as { name?: unknown; quantity?: unknown };
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!name || name.length > 200) continue;

    let quantity = 1;
    if (typeof row.quantity === "number" && Number.isFinite(row.quantity)) {
      quantity = Math.max(1, Math.round(row.quantity));
    } else if (typeof row.quantity === "string") {
      const n = parseFloat(row.quantity.replace(",", "."));
      if (Number.isFinite(n)) quantity = Math.max(1, Math.round(n));
    }

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ name, quantity });
  }

  return items.slice(0, 50);
}
