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

const VISION_CENTER_LINE_MAX = 22;

export type LinkedVisionCenterSummary = {
  line1: string;
  line2: string;
};

function stripParenthetical(text: string): string {
  return text.replace(/[（(][^）)]*[）)]/g, "").trim();
}

function fitVisionCenterLine(text: string, max = VISION_CENTER_LINE_MAX): string {
  const t = text.trim();
  if (!t) return "";
  if (t.length <= max) return t;

  for (const punct of ["、", "。", "・", " "] as const) {
    const idx = t.lastIndexOf(punct, max);
    if (idx > max * 0.45) {
      return t.slice(0, idx + (punct === " " ? 0 : 1)).trim();
    }
  }

  return `${t.slice(0, max)}…`;
}

function splitVisionCenterText(text: string): LinkedVisionCenterSummary {
  const parts = text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      line1: fitVisionCenterLine(parts[0]),
      line2: fitVisionCenterLine(parts[1]),
    };
  }

  const single = parts[0] ?? text.trim();
  if (!single) return { line1: "", line2: "" };
  if (single.length <= VISION_CENTER_LINE_MAX) {
    return { line1: single, line2: "" };
  }

  for (const punct of ["、", "。"] as const) {
    const idx = single.indexOf(punct);
    if (idx > 0 && idx < single.length - 1) {
      return {
        line1: fitVisionCenterLine(single.slice(0, idx + 1)),
        line2: fitVisionCenterLine(single.slice(idx + 1)),
      };
    }
  }

  const half = Math.min(VISION_CENTER_LINE_MAX, Math.ceil(single.length / 2));
  return {
    line1: fitVisionCenterLine(single.slice(0, half)),
    line2: fitVisionCenterLine(single.slice(half)),
  };
}

function withMottoOrService(
  line1: string,
  motto: string,
  service: string,
): LinkedVisionCenterSummary {
  if (!line1) return { line1: "", line2: "" };
  if (motto) return { line1, line2: fitVisionCenterLine(motto) };
  if (service) return { line1, line2: fitVisionCenterLine(service) };
  return { line1, line2: "" };
}

/** 思考拡張シート中央マス — Step2 人生ビジョンの2行要約 */
export function linkedVisionCenterSummary(
  purposeVision: PurposeVision,
  fallback = "",
): LinkedVisionCenterSummary {
  const main = purposeVision.visionMain.trim();
  const motto = purposeVision.visionMotto.trim();
  const service = purposeVision.lifePurposeService.trim();
  const leadParts = purposeVision.lifePurposeLead
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const fallbackVision = fallback.trim();

  if (main) {
    const stripped = stripParenthetical(main);
    const lines = splitVisionCenterText(stripped);
    if (lines.line1 && !lines.line2) {
      return withMottoOrService(lines.line1, motto, service);
    }
    return lines;
  }

  if (leadParts.length >= 2) {
    return {
      line1: fitVisionCenterLine(leadParts[0]),
      line2: fitVisionCenterLine(leadParts[1]),
    };
  }

  if (leadParts[0]) {
    return withMottoOrService(fitVisionCenterLine(leadParts[0]), motto, service);
  }

  if (service) {
    const lines = splitVisionCenterText(service);
    if (lines.line1 && !lines.line2) {
      return withMottoOrService(lines.line1, motto, "");
    }
    return lines;
  }

  if (motto) {
    return { line1: fitVisionCenterLine(motto), line2: "" };
  }

  if (fallbackVision) {
    return splitVisionCenterText(fallbackVision);
  }

  return { line1: "", line2: "" };
}

/** 思考拡張シート左上 — Step1 キーワード一覧 */
export function linkedPhilosophyKeywords(philosophy: LifePhilosophy): string {
  return philosophy.keywords
    .map((k) => k.trim())
    .filter(Boolean)
    .join("・");
}
