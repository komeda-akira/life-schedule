/** 目標の構造化シート — 書き方ガイド（ワークブック Step3 相当） */

export const GS_GUIDE_STEP_LABEL = "Step3 明確な「目標」を設定する";

export const GS_GUIDE_INTRO =
  "7つの分野について、短期・中期・長期の目標を設定しましょう。下の表は選択理論の5つの欲求と分野に沿って整理されています。";

export const GS_GUIDE_TOGGLE_SUMMARY = "書き方の説明を見る";

export const GS_GUIDE_TIMEFRAMES_TITLE = "期間の考え方";

export const GS_GUIDE_TIMEFRAMES = [
  { label: "短期目標", span: "1年未満", hint: "すぐ行動に移せる具体性を" },
  { label: "中期目標", span: "1〜5年", hint: "短期から中期へ、矢印の流れを意識" },
  { label: "長期目標", span: "5年以上", hint: "人生ビジョン・理念と一貫性を" },
] as const;

export const GS_GUIDE_CONDITIONS_TITLE = "よい目標の8つの条件";

export const GS_GUIDE_CONDITIONS = [
  "本当にそれを望んでいること",
  "長期目標と短期目標に一貫性があり、大きな目的に繋がっていること",
  "社会正義に反していないこと",
  "達成すべきことを具体的に述べ、すぐに行動に移せること",
  "定量化できる目標にすること",
  "肯定的なものであること",
  "自分のレベルに合っており、現実的でかつ挑戦できる面があること",
  "期限を切ること",
] as const;

export const GS_GUIDE_EXAMPLE_TITLE = "記入例";

export const GS_GUIDE_EXAMPLE_HINT =
  "短期 → 中期 → 長期へつながるイメージで書きます。体重の例のように、維持・定着の関係を示す場合もあります。";

export type GoalStructuringExampleRow = {
  theme: string;
  shortTerm: string;
  mediumTerm: string;
  longTerm: string;
};

export const GS_GUIDE_EXAMPLES: GoalStructuringExampleRow[] = [
  {
    theme: "ランニング",
    shortTerm: "10kmマラソンに参加する（20××年10月）",
    mediumTerm: "フルマラソンに参加する（20××年8月）",
    longTerm: "年3回フルマラソンに参加する（20××年）",
  },
  {
    theme: "体重",
    shortTerm: "体重72kgまで落とす（20××年12月）",
    mediumTerm: "体重66kgまで落とす（20××年12月）",
    longTerm: "体重64〜66kgを維持する（20××年）",
  },
  {
    theme: "睡眠",
    shortTerm: "毎日24時までに就寝する（20××年10月）",
    mediumTerm: "毎日6時間以上の睡眠を確保する（20××年12月）",
    longTerm: "毎日6時間以上の睡眠を確保する（20××年）",
  },
];
