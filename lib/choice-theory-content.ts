/** 選択理論モーダルの静的テキスト */

export const CHOICE_THEORY_TITLE = "選択理論";

export const CHOICE_THEORY_MODAL_TITLE = "選択理論の制定";

export const CHOICE_THEORY_INTRO =
  "選択理論はウィリアム・グラッサー博士が提唱した心理学です。人は生まれながらに5つの基本的欲求を持ち、その欲求を満たすために行動を選択します。目標の構造化シートでは、この5つの欲求を軸に、分野ごと・期間ごとに目標を整理します。";

export type ChoiceTheoryNeed = {
  needLabel: string;
  body: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  rowBgClass: string;
};

export const CHOICE_THEORY_NEEDS: ChoiceTheoryNeed[] = [
  {
    needLabel: "生存の欲求",
    body: "空気・水・食べ物・住居・睡眠・健康・安全など、生きていくために必要なものへの欲求。身体的な基盤を整える目標がここに入ります。",
    colorClass: "bg-emerald-500",
    borderClass: "border-emerald-200",
    bgClass: "bg-emerald-50/80",
    rowBgClass: "bg-emerald-50/35",
  },
  {
    needLabel: "愛・所属の欲求",
    body: "家族・友人・職場などに所属し、愛し愛される関係を保ちたいという欲求。人間関係や家庭に関する目標がここに入ります。",
    colorClass: "bg-rose-500",
    borderClass: "border-rose-200",
    bgClass: "bg-rose-50/80",
    rowBgClass: "bg-rose-50/35",
  },
  {
    needLabel: "力の欲求",
    body: "達成・承認・貢献・自己成長など、自分の価値を発揮したいという欲求。仕事・能力開発に関する目標がここに入ります。",
    colorClass: "bg-amber-500",
    borderClass: "border-amber-200",
    bgClass: "bg-amber-50/80",
    rowBgClass: "bg-amber-50/35",
  },
  {
    needLabel: "自由の欲求",
    body: "自分の考えや感情のままに行動し、物事を選び決断したいという欲求。経済的な自立や選択の余裕に関する目標がここに入ります。",
    colorClass: "bg-sky-500",
    borderClass: "border-sky-200",
    bgClass: "bg-sky-50/80",
    rowBgClass: "bg-sky-50/35",
  },
  {
    needLabel: "楽しみの欲求",
    body: "義務感にとらわれず、主体的に喜んで何かを行いたいという欲求。趣味・教養・余暇に関する目標がここに入ります。",
    colorClass: "bg-violet-500",
    borderClass: "border-violet-200",
    bgClass: "bg-violet-50/80",
    rowBgClass: "bg-violet-50/35",
  },
];

export const CHOICE_THEORY_QUALITY_WORLD =
  "上質世界とは、5つの基本的欲求を最も満たす理想のイメージです。シートに書く目標は、自分の上質世界に近づくための具体的な道筋として設定しましょう。";

export const CHOICE_THEORY_SHEET_HINT =
  "欲求（縦軸）× 分野（横軸）× 短期・中期・長期（期間）の組み合わせで、人生全体のバランスを見ながら目標を記入します。誰もが同じ強さの欲求を持つわけではなく、自分にとって大切な欲求から優先して書いても構いません。";

export const CHOICE_THEORY_BUTTON_SUBTITLE = "5つの基本欲求の説明を見る";

export const CHOICE_THEORY_NEED_COLORS = CHOICE_THEORY_NEEDS.map((need) => ({
  label: need.needLabel.replace(/の欲求$/, ""),
  className: need.colorClass,
}));

export function getChoiceTheoryNeedStyle(groupIndex: number): ChoiceTheoryNeed {
  return CHOICE_THEORY_NEEDS[groupIndex] ?? CHOICE_THEORY_NEEDS[0];
}
