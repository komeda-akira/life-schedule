/** 年間カレンダー — 記載コメント集約図のラベル */

export const YCS_BUTTON_TITLE = "年間カレンダー要約";
export const YCS_MODAL_TITLE = "年間カレンダー要約図";

export const YCS_COMMENT_SUBTITLE =
  "カレンダーに記載したスコープコメントと、月・週シートの抜粋を一年分まとめて表示します。";

export const YCS_YEAR_SCOPE_LABEL = "年のスコープコメント";
export const YCS_PLAN_SUMMARY_LABEL = "中長期計画（年列サマリー）";
export const YCS_MONTH_SCOPE_LABEL = "月のスコープコメント";
export const YCS_MONTH_SHEET_LABEL = "月間シート抜粋";
export const YCS_WEEK_SCOPE_LABEL = "週のスコープコメント";
export const YCS_WEEK_SHEET_LABEL = "週次プランナー抜粋";
export const YCS_EMPTY = "（未記入）";
export const YCS_NO_COMMENTS =
  "この年には、まだスコープコメントやシートの記載がありません。";
export const YCS_TIMELINE_TITLE = "月 → 週 のタイムライン";

export function ycsEntryCountLabel(count: number): string {
  return count > 0 ? `${count} 件の記載があります` : "記載はまだありません";
}
