/** 月ペイン下部 — セルフカウンセリング（手書きシート再現） */

export const MONTH_SELF_COUNSELING_TITLE = "セルフカウンセリング";

export type MonthSelfCounselingItem = {
  no: number;
  lines: readonly string[];
};

export const MONTH_SELF_COUNSELING_ITEMS: readonly MonthSelfCounselingItem[] = [
  {
    no: 1,
    lines: [
      "私は何を求めているのか？",
      "私にとって一番大切なものは何か？",
      "私が本当に求めているものは？",
    ],
  },
  {
    no: 2,
    lines: ["その為に「今」何をしているのか？"],
  },
  {
    no: 3,
    lines: [
      "その行動は私の求めているものを手に入れるのに効果的か？",
    ],
  },
  {
    no: 4,
    lines: ["もっと良い方法を考え出し、実行してみよう"],
  },
] as const;
