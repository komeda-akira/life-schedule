import type { LifePhilosophy } from "@/lib/life-philosophy";
import type { PurposeVision } from "@/lib/purpose-vision";

export const GS_LINKED_SECTION_HINT =
  "Step1「人生理念」と Step2「目的・ビジョン」で入力した内容が、ここに自動で反映されます。";

export const GS_LINKED_PHILOSOPHY_EMPTY =
  "Step1 でキーワードや一言を入力すると表示されます。";

export const GS_LINKED_VISION_EMPTY =
  "Step2 で「奉仕の実践」または「人生ビジョン（理想の姿）」を入力すると表示されます。";

/** 目標の構造化シート — Step1 人生理念から連動 */
export function linkedPhilosophyText(
  philosophy: LifePhilosophy,
  fallback = "",
): string {
  const keywords = philosophy.keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .join("・");
  if (keywords) return keywords;

  const word = philosophy.coreWord.trim();
  const note = philosophy.coreNote.trim();
  if (word && note) return `${word}（${note}）`;
  if (word) return word;

  return fallback.trim();
}

/** 目標の構造化シート — Step2 目的・ビジョンから連動 */
export function linkedVisionText(
  purposeVision: PurposeVision,
  fallback = "",
): string {
  const service = purposeVision.lifePurposeService.trim();
  if (service) return service;

  const main = purposeVision.visionMain.trim();
  if (main) return main;

  const lead = purposeVision.lifePurposeLead
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)[0];
  if (lead) return lead;

  return fallback.trim();
}

/** 思考拡張シート中央マス — Step1 の一言＋補足（北極星バー「理念」と同じ） */
export function linkedPhilosophyCenter(
  philosophy: LifePhilosophy,
): { word: string; note: string } {
  return {
    word: philosophy.coreWord.trim(),
    note: philosophy.coreNote.trim(),
  };
}

/** 思考拡張シート左上 — Step1 キーワード一覧 */
export function linkedPhilosophyKeywords(philosophy: LifePhilosophy): string {
  return philosophy.keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .join("・");
}
