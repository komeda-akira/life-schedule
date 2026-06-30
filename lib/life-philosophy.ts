import type { AppData } from "@/lib/types";

export const LIFE_PHILOSOPHY_REASON_COUNT = 5;

export type LifePhilosophy = {
  /** \u4fa1\u5024\u89b3\u30fb\u4fe1\u6761\u306a\u3069\u306e\u30ad\u30fc\u30ef\u30fc\u30c9 */
  keywords: string[];
  successReasons: [
    string,
    string,
    string,
    string,
    string,
  ];
  coreWord: string;
  coreNote: string;
};

export const DEFAULT_LIFE_PHILOSOPHY: LifePhilosophy = {
  keywords: [
    "\u8aa0\u5b9f",
    "\u611f\u8b1d",
    "\u4e0a\u8cea",
    "\u611b",
    "\u8b19\u865a",
    "\u5949\u4ed5",
    "\u601d\u3044\u3084\u308a",
    "\u6700\u5584",
    "\u6210\u9577",
    "\u8010\u5fcd",
    "\u5e73\u5b89",
    "\u512a\u3057\u3055",
  ],
  successReasons: [
    "\u5bb6\u65cf\u3092\u5b88\u308b\u305f\u3081",
    "\u81ea\u5df1\u5b9f\u73fe\u306e\u305f\u3081",
    "\u5e73\u548c\u306e\u305f\u3081",
    "\u65e5\u672c\u306e\u305f\u3081",
    "\u5b50\u5b6b\u7e41\u69ae\u306e\u305f\u3081",
  ],
  coreWord: "\u5229\u4ed6",
  coreNote: "\u6210\u529f\u306e\u571f\u53f0",
};

export type PyramidLayerDef = {
  label: string;
  sub?: string;
  /** \u571f\u53f0\u5074\uff08\u4eba\u751f\u7406\u5ff5\u30fb\u30d3\u30b8\u30e7\u30f3\uff09 */
  foundation?: boolean;
};

/** \u4e0b\uff08\u571f\u53f0\uff09\u2192 \u4e0a \u306e\u9806 */
export const PYRAMID_LAYERS_BOTTOM_UP: PyramidLayerDef[] = [
  {
    label: "\u4eba\u751f\u7406\u5ff5",
    sub: "\uff08\u4fa1\u5024\u89b3\u30fb\u54f2\u5b66\u30fb\u4fe1\u6761\u30fb\u7406\u5ff5\uff09",
    foundation: true,
  },
  {
    label: "\u4eba\u751f\u30d3\u30b8\u30e7\u30f3",
    sub: "\uff08\u4eba\u7269\u50cf\u30fb\u30e9\u30a4\u30d5\u30c7\u30b6\u30a4\u30f3\uff09",
    foundation: true,
  },
  { label: "\u76ee\u6a19\u306e\u8a2d\u5b9a" },
  { label: "\u8a08\u753b\u5316" },
  { label: "\u65e5\u3005\u306e\u5b9f\u8df5" },
];

function padReasons(
  reasons: unknown,
): LifePhilosophy["successReasons"] {
  const list = Array.isArray(reasons)
    ? reasons.map((r) => (typeof r === "string" ? r : ""))
    : [];
  const out = [...list];
  while (out.length < LIFE_PHILOSOPHY_REASON_COUNT) out.push("");
  return out.slice(0, LIFE_PHILOSOPHY_REASON_COUNT) as LifePhilosophy["successReasons"];
}

export function emptyLifePhilosophy(): LifePhilosophy {
  return {
    keywords: [],
    successReasons: ["", "", "", "", ""],
    coreWord: "",
    coreNote: "",
  };
}

export function normalizeLifePhilosophy(
  input?: Partial<LifePhilosophy> | null,
): LifePhilosophy {
  const base = emptyLifePhilosophy();
  if (!input) return base;

  const keywords = Array.isArray(input.keywords)
    ? input.keywords.map((k) => (typeof k === "string" ? k : ""))
    : [...base.keywords];

  return {
    keywords,
    successReasons: padReasons(input.successReasons ?? base.successReasons),
    coreWord:
      typeof input.coreWord === "string" ? input.coreWord : base.coreWord,
    coreNote:
      typeof input.coreNote === "string" ? input.coreNote : base.coreNote,
  };
}

/** 開発・デモ用に作者のサンプル文を補完 */
export function applyLifePhilosophyDefaults(data: AppData): AppData {
  return {
    ...data,
    lifePhilosophy: data.lifePhilosophy
      ? normalizeLifePhilosophy(data.lifePhilosophy)
      : { ...DEFAULT_LIFE_PHILOSOPHY, keywords: [...DEFAULT_LIFE_PHILOSOPHY.keywords] },
  };
}

export function visionBarExcerpt(philosophy: LifePhilosophy): string {
  const word = philosophy.coreWord.trim();
  const note = philosophy.coreNote.trim();
  if (!word) return "";
  if (!note) return word;
  return `${word}\uff08${note}\uff09`;
}
