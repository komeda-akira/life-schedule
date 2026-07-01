/** やりたいこと100リスト・自分100年史 — 書き方ガイド（ワークブック Step3） */

export const LW100_GUIDE_STEP_LABEL =
  "Step3 明確な「目標」を設定する — やりたいこと100リストと自分100年史";

export const LW100_GUIDE_BUTTON = "書き方の説明";

export const LW100_LIST_SECTION_TITLE = "人生でやりたいこと 100 リストの書き方";

export const LW100_LIST_INTRO =
  "何の制限もなかったとしたら、人生の中で、何をしたいですか。100 個書き出してみましょう。";

export const LW100_LIST_TIPS = [
  "思いついたものから順番に書いていく",
  "どんなに大きなことや、小さなことでも書く",
  "一度 100 個埋めてみたうえで見直す",
] as const;

export const LW100_LIST_EXAMPLE_TITLE = "（例）やりたいこと 100 リスト";

export const LW100_LIST_EXAMPLES = [
  "年収 2000 万円",
  "両親を海外旅行に連れて行く",
  "世界から戦争をなくす",
] as const;

export const LW100_HISTORY_SECTION_TITLE = "自分 100 年史の書き方";

export const LW100_HISTORY_INTRO =
  "自分の 100 年史をつくってみましょう。過去やり遂げたことや、これから成し遂げること、それぞれの年代でのテーマなど、自由に書いてみましょう。";

export const LW100_HISTORY_TIPS = [
  "現在に至るまでの印象的な内容を記入する",
  "やりたいこと 100 リストで掲げた内容をいつ実行するか記入する",
] as const;

export const LW100_HISTORY_EXAMPLE_TITLE = "（例）自分 100 年史";

export type Lw100HistoryExampleRow = {
  age: string;
  content: string;
};

export const LW100_HISTORY_EXAMPLES: Lw100HistoryExampleRow[] = [
  { age: "12歳", content: "県の作文コンテストに出品" },
  { age: "13歳", content: "トランペットを習い始める" },
  { age: "14歳", content: "英検準2級合格" },
  { age: "15歳", content: "〇〇高校入学" },
  { age: "16歳", content: "カナダへホームステイ" },
  { age: "37歳", content: "—" },
  { age: "38歳", content: "結婚 10 周年" },
  { age: "39歳", content: "マイホーム取得" },
  { age: "40歳", content: "両親と海外旅行へ" },
  { age: "41歳", content: "—" },
];

export const LW100_HISTORY_NOTE =
  "100 年史は北極星バーから「自分 100 年史」でも編集できます。リストで書いたやりたいことを、何歳頃に実現するか年代に当てはめていきましょう。";
