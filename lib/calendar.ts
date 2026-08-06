/** ローカル日の 0:00 */
export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 画面を開いたときのカレンダーカーソル（端末の今日） */
export function getCalendarInitialCursor(now = new Date()): Date {
  return startOfDay(now);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function addYears(d: Date, n: number): Date {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + n);
  return x;
}

/** 月曜始まりの週の月曜 0:00 */
export function getMonday(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  return addDays(x, delta);
}

/** 日曜始まりの週の日曜 0:00（Google カレンダー日本語 UI） */
export function getSunday(d: Date): Date {
  const x = startOfDay(d);
  return addDays(x, -x.getDay());
}

/**
 * 日曜始まりの月グリッド（常に 6 週 = 42 日）。Google カレンダー月表示と同じ。
 * @param year 西暦
 * @param month 1–12
 */
export function buildMonthGridDays(year: number, month: number): Date[] {
  const first = startOfDay(new Date(year, month - 1, 1));
  const gridStart = getSunday(first);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

/** 日曜始まりの曜日ヘッダー（日〜土） */
export const SUNDAY_WEEKDAY_LABELS = [
  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土",
] as const;

/** @deprecated 週次ペイン用。月グリッドは SUNDAY_WEEKDAY_LABELS を使う */
export const MONDAY_WEEKDAY_LABELS = [
  "月",
  "火",
  "水",
  "木",
  "金",
  "土",
  "日",
] as const;

const WD = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function formatWeekdayJa(d: Date): string {
  return WD[d.getDay()] ?? "—";
}

/** 土曜=青・日曜=赤（getDay: 0=日, 6=土） */
export function weekdayTextClass(d: Date): string {
  const day = d.getDay();
  if (day === 0) return "text-red-600";
  if (day === 6) return "text-blue-600";
  return "text-black";
}

export function formatMonthHeader(d: Date): string {
  return `${d.getFullYear()}年`;
}

export function formatWeekHeader(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function formatDayHeader(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${formatWeekdayJa(d)}）`;
}

export function formatWeekRowLabel(d: Date): string {
  return `${formatWeekdayJa(d)} ${d.getMonth() + 1}/${d.getDate()}`;
}

/** 年ペインの表示開始年（現時点＝2026年から、下へ未来） */
export const YEAR_PANE_MIN = 2026;
export const YEAR_PANE_MAX = 2041;

/** 年ペイン用: 古い年 → 新しい年の昇順 */
export function listYearsChronological(
  min = YEAR_PANE_MIN,
  max = YEAR_PANE_MAX,
): number[] {
  const ys: number[] = [];
  for (let y = min; y <= max; y++) ys.push(y);
  return ys;
}

/** 年ペインのスクロール内で、指定した年の行が上端に来るよう調整 */
export function scrollYearRowToTop(
  scrollContainer: HTMLElement | null,
  yearRow: HTMLElement | null,
): void {
  if (!scrollContainer || !yearRow) return;
  scrollContainer.scrollTop =
    yearRow.offsetTop -
    scrollContainer.offsetTop +
    scrollContainer.scrollTop;
}

export type TimedEvent = {
  id: string;
  title: string;
  startMin: number;
  endMin: number;
};

/** サンプル（参照キャプチャ相当: 2025-05-21） */
export const DEMO_EVENTS_2025_05_21: TimedEvent[] = [
  { id: "1", title: "朝会", startMin: 7 * 60 + 30, endMin: 8 * 60 + 30 },
  { id: "2", title: "チームミーティング", startMin: 9 * 60, endMin: 11 * 60 },
  { id: "3", title: "設計レビュー", startMin: 11 * 60, endMin: 12 * 60 + 30 },
  { id: "4", title: "顧客打合せ", startMin: 11 * 60 + 30, endMin: 14 * 60 + 30 },
  { id: "5", title: "進捗確認", startMin: 17 * 60, endMin: 18 * 60 },
  { id: "6", title: "夕礼", startMin: 20 * 60, endMin: 21 * 60 + 30 },
];

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export type PlacedEvent = TimedEvent & {
  lane: number;
  laneCount: number;
};

function overlaps(a: TimedEvent, b: TimedEvent): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

/** 時間重なりの連結成分ごとにレーン割当（単独イベントは幅100%） */
export function isToday(d: Date): boolean {
  const t = new Date();
  return isSameDay(d, t);
}

export type StoredTimedEvent = {
  id: string;
  title: string;
  startMin: number;
  endMin: number;
};

export function toTimedForLayout(
  events: { id: string; title: string; kind: string; startMin?: number; endMin?: number }[],
): StoredTimedEvent[] {
  const out: StoredTimedEvent[] = [];
  for (const e of events) {
    if (
      e.kind === "timed" &&
      typeof e.startMin === "number" &&
      typeof e.endMin === "number"
    ) {
      out.push({
        id: e.id,
        title: e.title,
        startMin: e.startMin,
        endMin: e.endMin,
      });
    }
  }
  return out;
}

export function excerptComment(text: string, max = 28): string {
  const t = text.trim();
  if (!t) return "";
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export function layoutDayEvents(events: TimedEvent[]): PlacedEvent[] {
  if (events.length === 0) return [];

  const visited = new Set<string>();
  const groups: TimedEvent[][] = [];

  function dfs(e: TimedEvent, acc: TimedEvent[]): void {
    if (visited.has(e.id)) return;
    visited.add(e.id);
    acc.push(e);
    for (const o of events) {
      if (o.id !== e.id && overlaps(e, o)) dfs(o, acc);
    }
  }

  for (const e of events) {
    if (!visited.has(e.id)) {
      const g: TimedEvent[] = [];
      dfs(e, g);
      groups.push(g);
    }
  }

  const result: PlacedEvent[] = [];
  for (const g of groups) {
    const sorted = [...g].sort(
      (a, b) => a.startMin - b.startMin || a.endMin - b.endMin,
    );
    const laneEnds: number[] = [];
    const laneById = new Map<string, number>();
    for (const ev of sorted) {
      let lane = laneEnds.findIndex((end) => end <= ev.startMin);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(ev.endMin);
      } else {
        laneEnds[lane] = ev.endMin;
      }
      laneById.set(ev.id, lane);
    }
    const laneCount = Math.max(1, laneEnds.length);
    for (const ev of sorted) {
      result.push({
        ...ev,
        lane: laneById.get(ev.id) ?? 0,
        laneCount,
      });
    }
  }
  return result;
}
