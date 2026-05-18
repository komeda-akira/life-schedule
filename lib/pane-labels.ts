/** \u30da\u30a4\u30f3\u8868\u793a\u6587\u5b57\uff08UTF-8 \u6587\u5b57\u5316\u3051\u9632\u6b62\u306e\u305f\u3081 Unicode \u30a8\u30b9\u30b1\u30fc\u30d7\u3067\u5b9a\u7fa9\uff09 */

export const YEAR_PANE_TITLE = "\u4e2d\u9577\u671f\u3001\u5e74\u9593\u884c\u52d5\u8a08\u753b";
export const MONTH_PANE_TITLE = "\u6708";
export const WEEK_PANE_TITLE = "\u9031";
export const DAY_PANE_TITLE = "\u65e5";

export const PANE_HINTS = {
  year: "2026\u5e74\u304b\u3089\u3002\u4e0b\u3078\u884c\u304f\u307b\u3069\u672a\u6765\u3002",
  month: "\u5e74\u9593\u306e\u91cd\u70b9\u30c6\u30fc\u30de\u3084\u53d6\u308a\u7d44\u307f\u3092\u6574\u7406\u3057\u307e\u3059\u3002",
  week: "\u9031\u6b21\u306e\u91cd\u70b9\u30bf\u30b9\u30af\u3084\u9032\u6357\u3092\u78ba\u8a8d\u3057\u307e\u3059\u3002",
  day: "\u4eca\u65e5\u306e\u30bf\u30b9\u30af\u3092\u30b7\u30f3\u30d7\u30eb\u306b\u7ba1\u7406\u3057\u307e\u3059\u3002",
} as const;

export const YEAR_START_LABEL = "\u8d77\u70b9";

export function scopeCommentTitle(year: number): string {
  return `${year}\u5e74\u306e\u30b9\u30b3\u30fc\u30d7\u30b3\u30e1\u30f3\u30c8`;
}

export const SCOPE_COMMENT_MONTH = "\u3053\u306e\u6708\u306e\u30b9\u30b3\u30fc\u30d7\u30b3\u30e1\u30f3\u30c8";
export const SCOPE_COMMENT_WEEK = "\u3053\u306e\u9031\u306e\u30b9\u30b3\u30fc\u30d7\u30b3\u30e1\u30f3\u30c8";

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
