/** 中長期行動計画表 — 書き方ガイド（アプリのシート構成に合わせた説明） */

import {
  MLTP_PLAN_DEFAULT_START_YEAR,
  MLTP_PLAN_END_YEAR,
  PLAN_THEME_ROW_COUNT,
  PLAN_YEARS_PER_PAGE,
} from "@/lib/mid-long-term-plan";

export const MLTP_GUIDE_STEP_LABEL =
  "Step4 目標達成のための『計画』を立てる";

export const MLTP_GUIDE_TITLE = "中長期行動計画表を作成する";

export const MLTP_GUIDE_INTRO = `目標の構造化シートで洗い出した目標を、この表に落とし込みます。上部で家族と重点目標を設定し、下の2つの表（年齢表・テーマ表）を${MLTP_PLAN_DEFAULT_START_YEAR}〜${MLTP_PLAN_END_YEAR}年の時間軸で埋めていきます。`;

export const MLTP_GUIDE_STEPS_TITLE = "このシートの書き方";

export const MLTP_GUIDE_TOGGLE_SUMMARY = "書き方の説明を見る";

export const MLTP_GUIDE_STEPS = [
  `計画期間と作成年を確認する。テーマ表・年齢表は${MLTP_PLAN_DEFAULT_START_YEAR}年〜${MLTP_PLAN_END_YEAR}年（${PLAN_YEARS_PER_PAGE}年ごとにページ切替）で表示されます。`,
  "「家族の名前と現在の年齢」で人数・名前・満年齢を入力する。生年と各年の満年齢が下の年齢表に自動反映されます。",
  "「中長期の最重点目標」を1つ書き、その右の6枠に分解した具体目標を記入する。",
  `テーマ表の${PLAN_THEME_ROW_COUNT}行にテーマ名を付ける。概要欄（①②）に、達成による成果のイメージや成功ポイントを書く。`,
  `各年列に、その年の行動・目標を記入する。「表示する期間」のボタンで${PLAN_YEARS_PER_PAGE}年ページを切り替え、全期間を埋める。`,
  "年齢表とテーマ表を照らし合わせ、家族のライフイベントを意識しながら、順算（今から先へ）と逆算（理想から今へ）で計画を調整する。",
] as const;

export type MltpGuideSectionMap = {
  label: string;
  where: string;
};

export const MLTP_GUIDE_SECTIONS: MltpGuideSectionMap[] = [
  {
    label: "作成年・計画期間",
    where: "シート上部（開始年〜終了年、作成日）",
  },
  {
    label: "家族の名前と現在の年齢",
    where: "青い枠のセクション → 年齢表（満年齢・生年は自動）",
  },
  {
    label: "中長期の最重点目標",
    where: "左上のテキスト欄",
  },
  {
    label: "中長期の目標（1〜6）",
    where: "右上の6枠（最重点目標の分解）",
  },
  {
    label: "テーマ名",
    where: "テーマ表・左列（7行、見出しを自由に編集）",
  },
  {
    label: "テーマ概要（①②）",
    where: "テーマ表・2列目（概要・補足。成果イメージ・成功ポイントもここ）",
  },
  {
    label: "年別の計画",
    where: "テーマ表・年列（表示中の5年分を自由記入）",
  },
];

export const MLTP_GUIDE_EXAMPLE_TITLE = "記入例（抜粋）";

export const MLTP_GUIDE_EXAMPLE_PRIORITY =
  "【○○エリアでNo.1の会社になる】売上10億円、経常利益1億円";

export const MLTP_GUIDE_EXAMPLE_GOALS = [
  "フルマラソンに参加する",
  "2年間で家族と海外旅行4回",
  "売上10億円、経常利益1億円",
  "資産形成（20××年×月までに貯蓄1億円）",
  "5年間で150冊読書",
  "6冊出版する",
] as const;

export const MLTP_GUIDE_EXAMPLE_FAMILY = [
  { name: "太郎", age: "35" },
  { name: "花子", age: "33" },
] as const;

export type MltpGuideExampleTheme = {
  themeName: string;
  overview: string;
  supplement: string;
  yearPlans: { year: string; plan: string }[];
};

export const MLTP_GUIDE_EXAMPLE_THEMES: MltpGuideExampleTheme[] = [
  {
    themeName: "健康管理",
    overview: "身体年齢30代、活力にあふれている",
    supplement: "毎日の食生活・適度な運動・体重66kg維持",
    yearPlans: [
      { year: "2026", plan: "食生活改善、1日8000歩、体重72kg" },
      { year: "2027", plan: "継続 → 10kmマラソン、体重68kg" },
    ],
  },
  {
    themeName: "家族関係",
    overview: "互いに最大の理解者・支援者である",
    supplement: "質の高い家族時間、夫婦だけの時間を確保",
    yearPlans: [{ year: "2026", plan: "年2回の家族旅行を計画に組み込む" }],
  },
];
