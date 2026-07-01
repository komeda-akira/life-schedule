/** 達成する計画の立て方 — 中長期行動計画表・プライムシート用 */

export const PLAN_GUIDE_STEP_LABEL = "Step4 目標を達成する計画の立て方";

export const PLAN_GUIDE_TITLE = "達成する計画の立て方";

export const PLAN_GUIDE_PRIME_SHEET_INTRO =
  "目標達成のプライムタイムで何をすべきか考え、プライムタイムシートに落とし込みます。下の入力欄①〜⑥は、この手順に沿って記入してください。";

export const PLAN_GUIDE_BUTTON_SUBTITLE =
  "パレートの法則・プライムタイム・書き方";

export const PLAN_GUIDE_PARETO_HEADING = "目標達成する時間の使い方とは";

export const PLAN_GUIDE_PARETO_LAW = "パレートの法則";

export const PLAN_GUIDE_PARETO_HIGHLIGHT =
  "成果の80％は、20％の優先事項で決まります";

export const PLAN_GUIDE_PARETO_BODY =
  "限られた時間の中で成果を出すには、自分の成功を左右する20％の優先事項を特定し、そこに計画と実行の時間を集中させることが大切です。";

export const PLAN_GUIDE_PRIME_HEADING =
  "プライムタイム（第2象限）を優先する";

export const PLAN_GUIDE_PRIME_DEFINITION =
  "プライムタイムは「未来創造の時間」です。";

export const PLAN_GUIDE_PRIME_BODY =
  "成果を出すためには、緊急かつ重要なことを終えたら、緊急ではなく重要な第2象限の行動をとる必要があります。そして、特に第2象限の中でも「目標達成に最も重要な時間」であるプライムタイムを、どのくらい計画に入れ、実行しているかが結果を大きく左右します。";

export const PLAN_GUIDE_SHEET_HEADING =
  "プライムタイムにすべきことを洗い出す";

export const PLAN_GUIDE_SHEET_INTRO =
  "実際に計画を立てる前に、目標達成のプライムタイムで何をすべきか考えてみましょう。";

export const PLAN_GUIDE_SHEET_STEPS_TITLE =
  "プライムタイムシートの書き方";

export const PLAN_GUIDE_TOGGLE_SUMMARY = "書き方の説明を見る";

export const PLAN_GUIDE_SHEET_STEPS = [
  "人生ビジョン・目標の構造化シートに書いた「仕事・職業分野」の目標の中から、特に実現したい目標を1つ選ぶ。",
  "シートの項目に従い「あるべき姿」「目標達成の指標（いつまでに何を）」「現状」「あるべき姿と現状のGAP」を書き出す。",
  "現状からあるべき姿を実現するために必要なことをリストアップする。",
  "リストの項目を「重要度・緊急度のマトリクス」に入れる。第2象限（重要だが緊急ではない）の項目をスケジュールに書き込む。",
] as const;

export const PLAN_GUIDE_EXAMPLE_TITLE = "記入例";

export const PLAN_GUIDE_OPEN_PRIME_SHEET = "プライムタイムシートを開く";

export type PlanGuideExampleField = {
  label: string;
  value: string;
};

export const PLAN_GUIDE_EXAMPLE_FIELDS: PlanGuideExampleField[] = [
  {
    label: "① 実現したいこと",
    value: "【○○業界で顧客満足度No.1の会社になる】",
  },
  {
    label: "② 目標達成の指標",
    value: "【20○○年9月までに顧客満足度調査で95点を達成する】",
  },
  { label: "③ 現在の状態", value: "満足度調査67点" },
  { label: "④ GAP", value: "満足度調査28点のGAP" },
];

export const PLAN_GUIDE_EXAMPLE_ACTIONS = [
  "生産性向上の仕組みづくり",
  "顧客満足度に連動した人事制度へ変更",
  "良い人材の採用（ホスピタリティ、フットワーク）",
  "採用戦略の見直し",
  "新商品・サービスの開発",
  "業界トップ企業の調査",
  "既存サービスラインの見直し",
] as const;

export const PLAN_GUIDE_SCHEDULE_NOTE =
  "第2象限の項目を裏面のスケジュールに書き込みましょう！";

export type PlanGuideQuadrant = {
  id: "q1" | "q2" | "q3" | "q4";
  urgency: "high" | "low";
  importance: "high" | "low";
  label: string;
  items: string[];
  highlight?: boolean;
};

export const PLAN_GUIDE_MATRIX_QUADRANTS: PlanGuideQuadrant[] = [
  {
    id: "q1",
    urgency: "high",
    importance: "high",
    label: "第1象限",
    items: ["満足度調査の結果分析", "既存サービスラインの見直し"],
  },
  {
    id: "q2",
    urgency: "low",
    importance: "high",
    label: "第2象限（プライムタイム）",
    items: [
      "10年計画書の策定",
      "顧客満足度に連動した人事制度へ変更",
      "採用方針見直し",
    ],
    highlight: true,
  },
  {
    id: "q3",
    urgency: "high",
    importance: "low",
    label: "第3象限",
    items: ["電話", "定例ミーティング"],
  },
  {
    id: "q4",
    urgency: "low",
    importance: "low",
    label: "第4象限",
    items: ["雑談", "時間つぶし"],
  },
];

export const PLAN_GUIDE_MATRIX_AXIS_URGENCY = "緊急度";
export const PLAN_GUIDE_MATRIX_AXIS_IMPORTANCE = "重要度";
export const PLAN_GUIDE_MATRIX_URGENT = "緊急";
export const PLAN_GUIDE_MATRIX_NOT_URGENT = "緊急ではない";
export const PLAN_GUIDE_MATRIX_IMPORTANT = "重要";
export const PLAN_GUIDE_MATRIX_NOT_IMPORTANT = "重要ではない";

export const PLAN_GUIDE_PARETO_INPUT_LABEL = "諸事（インプット）";
export const PLAN_GUIDE_PARETO_PRIORITY_LABEL = "優先事項 20％";
export const PLAN_GUIDE_PARETO_RESULT_LABEL = "成果（アウトプット）";
export const PLAN_GUIDE_PARETO_RESULT_HIGHLIGHT = "成果 80％";
