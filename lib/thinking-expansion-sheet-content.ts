/** 思考拡張シート（マンダラチャート）— Step3 目標設定用 */

export const TES_TITLE = "思考拡張シート";

export const TES_STEP_LABEL = "Step3 明確な「目標」を設定する";

export const TES_BUTTON_SUBTITLE =
  "人生ビジョンを中心に8つのテーマを広げる";

export const TES_MODAL_TITLE = "目標設定のための思考拡張シート";

export const TES_INTRO =
  "中央に Step2 で描いた人生ビジョンの要約を置き、周囲8マスにテーマを書きます。各テーマは外側の3×3ブロックの中心に連動し、さらに8方向へ具体化していきます。";

export const TES_CENTER_LABEL = "人生ビジョン（中央）";

export const TES_CENTER_EMPTY =
  "Step2「目的・ビジョン」で人生ビジョンを入力すると、中央マスに要約が自動表示されます。";

export const TES_THEME_HINT_TITLE = "テーマの例（中央ブロックの周囲8マス）";

export const TES_DEFAULT_THEMES = [
  "健康・体力",
  "人間関係",
  "家族・家庭",
  "仕事・職業",
  "能力開発",
  "経済・蓄財",
  "趣味・教養",
  "自分で1つテーマを定める",
] as const;

export const TES_SYNC_HINT =
  "中央3×3のテーマと、外側各ブロックの中心は自動で同期されます。";

export const TES_LEGEND_PHILOSOPHY = "人生ビジョン（中央）";
export const TES_LEGEND_THEME = "テーマ（8分野）";
export const TES_LEGEND_DETAIL = "具体化（自由記入）";

export const TES_VISION_LINK_LABEL = "Step2 で入力した人生ビジョン";
export const TES_VISION_LINK_EMPTY =
  "Step2「目的・ビジョン」で入力すると、ここに表示されます。";

export const TES_PHILOSOPHY_LINK_LABEL = "Step1 で入力した人生理念";
export const TES_PHILOSOPHY_LINK_EMPTY =
  "Step1「人生理念」でキーワードや一言を入力すると、ここに表示されます。";

export const TES_LINKED_HEADER_HINT =
  "上段は Step1 の人生理念と Step2 の人生ビジョン全文。中央マスにはビジョンの要約（2行以内）が自動表示されます。";

export const TES_INPUT_HINT =
  "各マスをタップして入力。テーマは中央と外側ブロックの中心で自動同期します。";

export const TES_EXAMPLE_TITLE = "記入例（折りたたみ）";

export const TES_EXAMPLE_VISION =
  "会社＆業界トップ\nリーダーとして縁ある人を幸せにする";

export const TES_EXAMPLE_THEMES = [
  "健全な財務体質",
  "100歳まで健康",
  "信頼し合える友・仲間",
  "温かい家庭",
  "能力開発",
  "趣味・教養",
  "蓄財・経済",
  "地域貢献",
] as const;

/** テーマ index → 外側ブロック index（中央ブロック4を除く） */
export const TES_THEME_TO_OUTER_BLOCK = [0, 1, 2, 3, 5, 6, 7, 8] as const;

/** 中央ブロック内のテーマ位置（local 0-2）— 上から左回りに近い配置 */
export const TES_THEME_LOCAL_COORDS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 2],
  [2, 0],
  [2, 1],
  [2, 2],
];

export const TES_BLOCK_ORIGINS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, 3],
  [0, 6],
  [3, 0],
  [3, 3],
  [3, 6],
  [6, 0],
  [6, 3],
  [6, 6],
];

export const TES_GRID_SIZE = 9;
export const TES_CENTER_BLOCK = 4;
export const TES_VISION_ROW = 4;
export const TES_VISION_COL = 4;
