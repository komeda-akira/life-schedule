/** \u30da\u30a4\u30f3\u8868\u793a\u6587\u5b57\uff08UTF-8 \u6587\u5b57\u5316\u3051\u9632\u6b62\u306e\u305f\u3081 Unicode \u30a8\u30b9\u30b1\u30fc\u30d7\u3067\u5b9a\u7fa9\uff09 */

export const YEAR_PANE_TITLE = "\u4e2d\u9577\u671f\u3001\u5e74\u9593\u884c\u52d5\u8a08\u753b";
export const OPEN_MLTP_HINT =
  "\u30af\u30ea\u30c3\u30af\u3067\u4e2d\u9577\u671f\u884c\u52d5\u8a08\u753b\u8868\u3092\u958b\u304f";
export const MONTH_PANE_TITLE = "\u6708";
export const WEEK_PANE_TITLE = "\u9031";
export const DAY_PANE_TITLE = "\u65e5";

export const PANE_HINTS = {
  /** \u5317\u6975\u661f\u300c\u7406\u5ff5\u300d\u884c\uff08\u5e74\u5217\u306e\u8aac\u660e\uff09 */
  year: "\u4eba\u751f\u7406\u5ff5\u30fb\u30d3\u30b8\u30e7\u30f3\u304b\u3089\u9006\u7b97\u3057\u3066\u8a2d\u8a08",
  month:
    "\u6708\u3092\u30bf\u30c3\u30d7\u3057\u3066\u5207\u308a\u66ff\u3048\u3002\u6708\u9593\u30b7\u30fc\u30c8\u306f\u4e0a\u306e\u5e74\u8868\u793a\u304b\u4e0b\u306e\u30dc\u30bf\u30f3\u304b\u3089\u958b\u304d\u307e\u3059\u3002",
  week: "\u7b2cN\u9031\u3092\u30bf\u30c3\u30d7\u3057\u3066\u5207\u308a\u66ff\u3048\u3002\u9031\u6b21\u30d7\u30e9\u30f3\u30ca\u30fc\u306f\u4e0a\u306e\u5e74\u6708\u8868\u793a\u304b\u4e0b\u306e\u30dc\u30bf\u30f3\u304b\u3089\u958b\u304d\u307e\u3059\u3002",
  day: "\u4eca\u65e5\u306e\u30bf\u30b9\u30af\u3092\u30b7\u30f3\u30d7\u30eb\u306b\u7ba1\u7406\u3057\u307e\u3059\u3002",
} as const;

export const YEAR_START_LABEL = "\u8d77\u70b9";

export function scopeCommentTitle(year: number): string {
  return `${year}\u5e74\u306e\u30b9\u30b3\u30fc\u30d7\u30b3\u30e1\u30f3\u30c8`;
}

export const SCOPE_COMMENT_MONTH = "\u3053\u306e\u6708\u306e\u30b9\u30b3\u30fc\u30d7\u30b3\u30e1\u30f3\u30c8";
export const SCOPE_COMMENT_WEEK = "\u3053\u306e\u9031\u306e\u30b9\u30b3\u30fc\u30d7\u30b3\u30e1\u30f3\u30c8";
export const OPEN_MONTHLY_SHEET_HINT =
  "\u30af\u30ea\u30c3\u30af\u3067\u6708\u9593\u30b7\u30fc\u30c8\u3092\u958b\u304f";
export const OPEN_WEEKLY_SHEET_HINT =
  "\u30af\u30ea\u30c3\u30af\u3067\u9031\u6b21\u30d7\u30e9\u30f3\u30ca\u30fc\u3092\u958b\u304f";
export const OPEN_MONTHLY_SHEET_ACTION = "\u6708\u9593\u30b7\u30fc\u30c8\u3092\u958b\u304f";
export const OPEN_WEEKLY_SHEET_ACTION = "\u9031\u6b21\u30d7\u30e9\u30f3\u30ca\u30fc\u3092\u958b\u304f";
export const MONTH_SWITCH_HINT =
  "\u6708\u3092\u30bf\u30c3\u30d7\u3057\u3066\u8868\u793a\u3092\u5207\u308a\u66ff\u3048";
export const WEEK_SWITCH_SECTION = "\u9031\u3092\u5207\u308a\u66ff\u3048";
export const WEEK_SWITCH_HINT =
  "\u30bf\u30c3\u30d7\u3057\u3066\u8868\u793a\u9031\u3092\u5909\u66f4\uff08\u30d7\u30e9\u30f3\u30ca\u30fc\u306f\u958b\u304d\u307e\u305b\u3093\uff09";
export const WEEK_DAY_SECTION = "\u65e5\u3092\u5207\u308a\u66ff\u3048";

export const MOBILE_TABS = ["\u5e74", "\u6708", "\u9031", "\u65e5"] as const;

export const LABEL_PREV_YEAR = "\u524d\u5e74";
export const LABEL_NEXT_YEAR = "\u7fcc\u5e74";
export const LABEL_PREV_WEEK = "\u524d\u9031";
export const LABEL_NEXT_WEEK = "\u7fcc\u9031";
export const LABEL_PREV_DAY = "\u524d\u65e5";
export const LABEL_NEXT_DAY = "\u7fcc\u65e5";

export const LABEL_ALL_DAY = "\u7d42\u65e5";
export const LABEL_ADD_ALL_DAY = "\u30af\u30ea\u30c3\u30af\u3067\u7d42\u65e5\u4e88\u5b9a\u3092\u8ffd\u52a0";
export const LABEL_ADD_TIMED =
  "\u30bf\u30a4\u30e0\u30e9\u30a4\u30f3\u3092\u30af\u30ea\u30c3\u30af\u3057\u3066\u4e88\u5b9a\u3092\u8ffd\u52a0";

export function monthLabel(monthIndex: number): string {
  return `${monthIndex + 1}\u6708`;
}

export function scopeHeadingYearMonth(year: number, month: number): string {
  return `${year}\u5e74${month}\u6708`;
}

export function scopeHeadingYear(year: number): string {
  return `${year}\u5e74`;
}
