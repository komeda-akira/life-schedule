export function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== undefined;
}

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** 429 等で主モデルが使えないときの代替（新規 AQ キーは 2.0 系の無料枠 0 になりやすい） */
export const GEMINI_MODEL_FALLBACKS = [
  "gemini-2.5-flash-lite",
] as const;

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function getGeminiModelCandidates(): string[] {
  const primary = getGeminiModel();
  const fallbacks = GEMINI_MODEL_FALLBACKS.filter((m) => m !== primary);
  return [primary, ...fallbacks];
}
