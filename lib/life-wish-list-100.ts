import type { AppData } from "@/lib/types";

export const LIFE_WISH_LIST_100_LABEL =
  "\u4eba\u751f\u3067\u3084\u308a\u305f\u3044\u3053\u3068 100 \u30ea\u30b9\u30c8";

export const LIFE_WISH_LIST_100_EXCERPT =
  "100\u306e\u3084\u308a\u305f\u3044\u3053\u3068\u3092\u8a18\u9332";

export const LIFE_WISH_LIST_100_COUNT = 100;

export const LIFE_WISH_LIST_100_COLUMNS = [
  { start: 1, end: 25 },
  { start: 26, end: 50 },
  { start: 51, end: 75 },
  { start: 76, end: 100 },
] as const;

export const LIFE_WISH_LIST_100_SAVE_HINT =
  "\u5165\u529b\u5185\u5bb9\u306f\u81ea\u52d5\u4fdd\u5b58\u3055\u308c\u307e\u3059\u3002";

export type LifeWishList100 = {
  /** index 0 = No.1 */
  items: string[];
};

const DEFAULT_ITEMS_RAW: string[] = [
  "\u5e74\u53ce 2\u5104 \u2192 10\u5104",
  "AI\u30de\u30b9\u30bf\u30fc",
  "\u516c\u8a8d\u4f1a\u8a08\u58eb\u3068\u3057\u3066\u65e5\u672c\u4e00",
  "\u4e16\u754c\u65c5\u884c",
  "\u30b0\u30ed\u30fc\u30d0\u30eb\u306b\u50cd\u304f",
  "\u7d4c\u55b6\u30b3\u30f3\u30b5\u30eb",
  "\u6599\u7406\u4eba\u306b\u306a\u308b",
  "\u30de\u30fc\u30b1\u30c6\u30a3\u30f3\u30b0",
  "\u72ec\u7acb\u958b\u696d\uff08\u4e0a\u5834\u3059\u308b\uff09",
  "\u6771\u4eac\u306b\u4f4f\u3080",
  "\u6295\u8cc7\u30de\u30b9\u30bf\u30fc\u306b\u306a\u308b",
  "\u82f1\u8a9e\u30de\u30b9\u30bf\u30fc\u3059\u308b",
  "\u30b9\u30a6\u30a7\u30fc\u30c7\u30f3\u30cf\u30a6\u30b9\u3092\u5efa\u3066\u308b",
  "\u7b4b\u30c8\u30ec",
  "\u7981\u9152",
  "\u97f3\u697d",
  "\u30bf\u30c3\u30d7\u30c0\u30f3\u30b9",
  "\u7d4c\u55b6\u30b3\u30f3\u30b5\u30eb\u30bf\u30f3\u30c8\u306b\u306a\u308b",
  "\u30b0\u30e9\u30f3\u30d5\u30ed\u30f3\u30c8\u306b\u30de\u30f3\u30b7\u30e7\u30f3\u3092\u8cb7\u3046",
  "\u6771\u4eac\u306b\u3082\u30de\u30f3\u30b7\u30e7\u30f3\u3092\u4fdd\u6709\u3059\u308b",
  "\u30b7\u30df\u3068\u308a",
  "\u8131\u6bdb\uff08\u30d2\u30b2\uff09",
  "\u30db\u30ef\u30a4\u30c8\u30cb\u30f3\u30b0",
  "\u30ae\u30bf\u30fc",
  "\u6697\u7b972\u7d1a",
  "\u8aad\u66f8",
  "\u7fd2\u5b57",
];

function createDefaultItems(): string[] {
  const items = Array<string>(LIFE_WISH_LIST_100_COUNT).fill("");
  DEFAULT_ITEMS_RAW.forEach((text, i) => {
    if (i < LIFE_WISH_LIST_100_COUNT) items[i] = text;
  });
  return items;
}

export const DEFAULT_LIFE_WISH_LIST_100: LifeWishList100 = {
  items: createDefaultItems(),
};

function normalizeItems(input: unknown, base: string[]): string[] {
  if (!Array.isArray(input)) return [...base];
  return Array.from({ length: LIFE_WISH_LIST_100_COUNT }, (_, i) =>
    typeof input[i] === "string" ? input[i] : base[i] ?? "",
  );
}

export function normalizeLifeWishList100(
  input?: Partial<LifeWishList100> | null,
): LifeWishList100 {
  const base = DEFAULT_LIFE_WISH_LIST_100;
  if (!input) return { items: [...base.items] };
  return { items: normalizeItems(input.items, base.items) };
}

export function lifeWishList100BarExcerpt(data: LifeWishList100): string {
  const first = data.items.find((t) => t.trim().length > 0)?.trim();
  if (first) return first;
  return LIFE_WISH_LIST_100_EXCERPT;
}

export function applyLifeWishList100Defaults(data: AppData): AppData {
  return {
    ...data,
    lifeWishList100: normalizeLifeWishList100(data.lifeWishList100),
  };
}
