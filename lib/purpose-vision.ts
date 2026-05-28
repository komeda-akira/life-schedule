import type { AppData } from "@/lib/types";

export const LIFE_PURPOSE_ACTION_COUNT = 5;

export type PurposeVision = {
  lifePurposeLead: string;
  lifePurposeService: string;
  lifePurposeActions: [
    string,
    string,
    string,
    string,
    string,
  ];
  visionMain: string;
  visionNumberOneMeans: string;
  visionInfluenceMeans: string;
  visionEconomic: string;
  visionAbility: string;
  visionSpiritual: string;
  visionHealth: string;
  visionMotto: string;
};

export const DEFAULT_PURPOSE_VISION: PurposeVision = {
  lifePurposeLead:
    "\u611b\u3059\u308b\u5bb6\u65cf\u3068\u611b\u3059\u308b\u4ef2\u9593\u3001\u611b\u3059\u308b\u65e5\u672c\u306e\u5b89\u5fc3\u3001\u5b89\u5168\u3001\u5e73\u548c\u306a\u672a\u6765\u3078\u306e\u767a\u5c55\u306e\u305f\u3081\u306b\u751f\u304d\u308b",
  lifePurposeService:
    "\u4f1a\u8a08\u3092\u901a\u3058\u3066\u5bb6\u65cf\u306e\u767a\u5c55\u306e\u305f\u3081\u3001\u3072\u3044\u3066\u306f\u793e\u4f1a\u306e\u7e41\u69ae\u3001\u5b89\u5168\u3001\u5e73\u548c\u306b\u8ca2\u732e\u3059\u308b\u3053\u3068\u3092\u76ee\u7684\u306b\u5949\u4ed5\u3092\u5b9f\u8df5\u3059\u308b\u3002",
  lifePurposeActions: [
    "\u6642\u4ee3\u306e\u5909\u5316\u3092\u7684\u78ba\u306b\u3068\u3089\u3048\u3001\u5e38\u306b\u512a\u308c\u305f\u76f4\u611f\u7684\u6d1e\u5bdf\u529b\u3092\u6301\u3063\u3066\u5909\u5316\u306b\u5bfe\u5fdc\u3059\u308b\u3068\u5171\u306b\u8fc5\u901f\u306a\u82f1\u65ad\u7684\u884c\u52d5\u529b\u3092\u990a\u6210\u3057\u7d9a\u3051\u308b",
    "\u6b63\u3057\u3044\u65b9\u5411\u306b\u4eba\u3073\u3068\u3092\u5c0e\u304f\u306e\u306f\u4eba\u9593\u3068\u3057\u3066\u6700\u9ad8\u306e\u5949\u4ed5\u3067\u3042\u308b\u3002\u305d\u306e\u70ba\u306b\u306f\u81ea\u3089\u306e\u9032\u6b69\u5411\u4e0a\u306e\u305f\u3081\u306e\u56b4\u3057\u3044\u81ea\u5df1\u7814\u9452\u306b\u52aa\u3081\u308b",
    "",
    "",
    "",
  ],
  visionMain:
    "\u5949\u4ed5\u306e\u70ba\u306e\u69cb\u9020\u3092\u5b9f\u8df5\u3057\u3001\u4f1a\u8a08\u58eb\u3068\u3057\u3066\u65e5\u672c\u4e00\u306e\u4f1a\u8a08\u4eba\u306b\u306a\u308b\u3002\uff0854\u6b73\u307e\u3067\u306b\u5b9f\u73fe\u3059\u308b\uff09",
  visionNumberOneMeans:
    "\u65e5\u672c\u4e00\u3068\u306f\u2026 \u77e5\u540d\u5ea6\u3001\u5f71\u97ff\u529b\u304c\u6700\u9ad8\u306e\u72b6\u614b",
  visionInfluenceMeans:
    "\u5f71\u97ff\u529b\u3068\u306f\u2026 \u7269\u5fc3\u5171\u306b\u8c4a\u304b\u306b\u306a\u308b\u30b3\u30f3\u30b5\u30eb\u30c6\u30a3\u30f3\u30b0\u304c\u3067\u304d\u308b\u3002\uff08\u502b\u7406\u3001\u91d1\u3001\u4f53\u3001\u4eba\u9593\u95a2\u4fc2\uff09",
  visionEconomic: "\u5e74\u53ce2\u5104 \u2192 10\u5104 \u4f1a\u793e(\u4e0a\u5834)",
  visionAbility:
    "\u3042\u3089\u3086\u308b\u8ab2\u984c\u3092\u89e3\u6c7a\u3067\u304d\u308b\u77e5\u8b58\u30ce\u30a6\u30cf\u30a6 \u30b9\u30d4\u30fc\u30c9\u306e\u3042\u308b\u6b63\u78ba\u306a\u4ed5\u4e8b",
  visionSpiritual: "\u5e38\u306b\u30dd\u30b8\u30c6\u30a3\u30d6\u306b\u524d\u5411\u304d\u306b\u751f\u304d\u308b",
  visionHealth:
    "\u5e38\u306b\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u3092\u884c\u3044\u30d9\u30b9\u30c8\u30b3\u30f3\u30c7\u30a3\u30b7\u30e7\u30f3\u3092\u4fdd\u3064",
  visionMotto: "\u601d\u8003\u306f\u73fe\u5b9f\u5316\u3059\u308b\u3002",
};

type LegacyPurposeVision = Partial<PurposeVision> & {
  lifePurposeAction1?: string;
  lifePurposeAction2?: string;
};

function mergeField(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeActions(
  input: LegacyPurposeVision,
  base: PurposeVision["lifePurposeActions"],
): PurposeVision["lifePurposeActions"] {
  if (Array.isArray(input.lifePurposeActions)) {
    return Array.from(
      { length: LIFE_PURPOSE_ACTION_COUNT },
      (_, i) => mergeField(input.lifePurposeActions![i], base[i]),
    ) as PurposeVision["lifePurposeActions"];
  }

  return [
    mergeField(input.lifePurposeAction1, base[0]),
    mergeField(input.lifePurposeAction2, base[1]),
    base[2],
    base[3],
    base[4],
  ];
}

export function normalizePurposeVision(
  input?: LegacyPurposeVision | null,
): PurposeVision {
  const base = DEFAULT_PURPOSE_VISION;
  if (!input) return { ...base };

  return {
    lifePurposeLead: mergeField(input.lifePurposeLead, base.lifePurposeLead),
    lifePurposeService: mergeField(
      input.lifePurposeService,
      base.lifePurposeService,
    ),
    lifePurposeActions: normalizeActions(input, base.lifePurposeActions),
    visionMain: mergeField(input.visionMain, base.visionMain),
    visionNumberOneMeans: mergeField(
      input.visionNumberOneMeans,
      base.visionNumberOneMeans,
    ),
    visionInfluenceMeans: mergeField(
      input.visionInfluenceMeans,
      base.visionInfluenceMeans,
    ),
    visionEconomic: mergeField(input.visionEconomic, base.visionEconomic),
    visionAbility: mergeField(input.visionAbility, base.visionAbility),
    visionSpiritual: mergeField(input.visionSpiritual, base.visionSpiritual),
    visionHealth: mergeField(input.visionHealth, base.visionHealth),
    visionMotto: mergeField(input.visionMotto, base.visionMotto),
  };
}

export function purposeVisionBarExcerpt(pv: PurposeVision): string {
  const motto = pv.visionMotto.trim();
  if (motto) return motto;
  const lead = pv.lifePurposeLead.trim();
  if (lead) return lead;
  return pv.visionMain.trim();
}

/** 未保存時にワークシート既定文を補完 */
export function applyPurposeVisionDefaults(data: AppData): AppData {
  return {
    ...data,
    purposeVision: normalizePurposeVision(data.purposeVision),
  };
}
