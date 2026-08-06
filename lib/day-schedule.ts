/** 日次タイムライン（Google カレンダー風）の共通定数・ユーティリティ */

export const TIMELINE_SNAP_MINUTES = 15;
export const TIMELINE_DEFAULT_DURATION_MIN = 60;
export const TIMELINE_MIN_DURATION_MIN = 15;
/** 1日の終端（分）。終了時刻として 24:00 = 翌 0:00 を表す */
export const TIMELINE_DAY_END_MIN = 24 * 60;
/** HTML time 入力で扱える最大分（23:59） */
export const TIMELINE_INPUT_MAX_MIN = 23 * 60 + 59;

const EVENT_COLOR_CLASSES = [
  "border-l-[3px] border-l-blue-600 bg-blue-50/95 text-blue-950 hover:bg-blue-100/95",
  "border-l-[3px] border-l-emerald-600 bg-emerald-50/95 text-emerald-950 hover:bg-emerald-100/95",
  "border-l-[3px] border-l-violet-600 bg-violet-50/95 text-violet-950 hover:bg-violet-100/95",
  "border-l-[3px] border-l-amber-600 bg-amber-50/95 text-amber-950 hover:bg-amber-100/95",
  "border-l-[3px] border-l-rose-600 bg-rose-50/95 text-rose-950 hover:bg-rose-100/95",
  "border-l-[3px] border-l-cyan-600 bg-cyan-50/95 text-cyan-950 hover:bg-cyan-100/95",
] as const;

export function snapTimelineMinutes(minutes: number): number {
  const snapped =
    Math.round(minutes / TIMELINE_SNAP_MINUTES) * TIMELINE_SNAP_MINUTES;
  return Math.min(TIMELINE_DAY_END_MIN, Math.max(0, snapped));
}

/** クリック位置を含むスロット開始（Googleカレンダーは floor） */
export function floorSnapMinutes(minutes: number): number {
  const snapped =
    Math.floor(minutes / TIMELINE_SNAP_MINUTES + 1e-9) * TIMELINE_SNAP_MINUTES;
  return Math.min(TIMELINE_DAY_END_MIN, Math.max(0, snapped));
}

/** タイムライン内の Y 座標（px）→ 0:00 起点の分 */
export function minutesFromTimelineY(
  y: number,
  hourPx: number,
): number {
  return snapTimelineMinutes((y / hourPx) * 60);
}

/** 開始時刻オフセット付き（例: 週次 5:00 始まり） */
export function minutesFromTimelineYWithOffset(
  y: number,
  hourPx: number,
  startHour: number,
): number {
  return snapTimelineMinutes(startHour * 60 + (y / hourPx) * 60);
}

export function normalizeCreateRange(
  startMin: number,
  endMin: number,
): { startMin: number; endMin: number } {
  let a = snapTimelineMinutes(Math.min(startMin, endMin));
  let b = snapTimelineMinutes(Math.max(startMin, endMin));
  if (b <= a) {
    b = Math.min(TIMELINE_DAY_END_MIN, a + TIMELINE_DEFAULT_DURATION_MIN);
  }
  if (b - a < TIMELINE_MIN_DURATION_MIN) {
    b = Math.min(TIMELINE_DAY_END_MIN, a + TIMELINE_MIN_DURATION_MIN);
  }
  // 日末付近で長さ 0 になった場合は開始を手前にずらす
  if (b <= a) {
    a = Math.max(0, TIMELINE_DAY_END_MIN - TIMELINE_DEFAULT_DURATION_MIN);
    b = TIMELINE_DAY_END_MIN;
  }
  return { startMin: a, endMin: b };
}

export type EventManipMode = "move" | "resize-start" | "resize-end";

/** ドラッグ移動・上下端リサイズ後の開始・終了（分） */
export function computeManipulatedRange(
  mode: EventManipMode,
  pointerMin: number,
  originStartMin: number,
  originEndMin: number,
  grabOffsetMin: number,
): { startMin: number; endMin: number } {
  const duration = Math.max(
    TIMELINE_MIN_DURATION_MIN,
    originEndMin - originStartMin,
  );

  if (mode === "move") {
    let startMin = snapTimelineMinutes(pointerMin - grabOffsetMin);
    startMin = Math.max(0, Math.min(TIMELINE_DAY_END_MIN - duration, startMin));
    return { startMin, endMin: startMin + duration };
  }

  if (mode === "resize-start") {
    let startMin = snapTimelineMinutes(pointerMin);
    startMin = Math.min(startMin, originEndMin - TIMELINE_MIN_DURATION_MIN);
    startMin = Math.max(0, startMin);
    return { startMin, endMin: originEndMin };
  }

  let endMin = snapTimelineMinutes(pointerMin);
  endMin = Math.max(endMin, originStartMin + TIMELINE_MIN_DURATION_MIN);
  endMin = Math.min(TIMELINE_DAY_END_MIN, endMin);
  return { startMin: originStartMin, endMin };
}

export function formatMinutesClock(minutes: number): string {
  if (minutes >= TIMELINE_DAY_END_MIN) return "24:00";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/** Google カレンダー月表示風（例: 午前11時 / 午後3:30） */
export function formatMinutesGoogleMonth(minutes: number): string {
  if (minutes >= TIMELINE_DAY_END_MIN) return "午後12時";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h < 12 ? "午前" : "午後";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  if (m === 0) return `${period}${h12}時`;
  return `${period}${h12}:${m.toString().padStart(2, "0")}`;
}

const MONTH_EVENT_PALETTE = [
  { dot: "bg-[#d50000]", banner: "bg-[#0b8043] text-white hover:bg-[#097038]" },
  { dot: "bg-[#e67c73]", banner: "bg-[#039be5] text-white hover:bg-[#0288d1]" },
  { dot: "bg-[#f4511e]", banner: "bg-[#8e24aa] text-white hover:bg-[#7b1fa2]" },
  { dot: "bg-[#33b679]", banner: "bg-[#e67c73] text-white hover:bg-[#d97066]" },
  { dot: "bg-[#039be5]", banner: "bg-[#f4511e] text-white hover:bg-[#e64a19]" },
  { dot: "bg-[#7986cb]", banner: "bg-[#3f51b5] text-white hover:bg-[#3949ab]" },
] as const;

function eventColorIndex(eventId: string): number {
  let hash = 0;
  for (let i = 0; i < eventId.length; i++) {
    hash = (hash + eventId.charCodeAt(i)) % 997;
  }
  return hash % MONTH_EVENT_PALETTE.length;
}

/** 月グリッド：時刻付き予定のドット色 */
export function eventMonthDotClass(eventId: string): string {
  return MONTH_EVENT_PALETTE[eventColorIndex(eventId)]!.dot;
}

/** 月グリッド：終日・複数日バナー色 */
export function eventMonthBannerClass(eventId: string): string {
  return MONTH_EVENT_PALETTE[eventColorIndex(eventId)]!.banner;
}

export function formatMinutesRange(startMin: number, endMin: number): string {
  return `${formatMinutesClock(startMin)} – ${formatMinutesClock(endMin)}`;
}

/** `<input type="time">` 用（24:00 はブラウザ非対応のため 23:59 に丸める） */
export function minutesToTimeInput(minutes: number): string {
  const clamped = Math.min(
    TIMELINE_INPUT_MAX_MIN,
    Math.max(0, Math.floor(minutes)),
  );
  const h = Math.floor(clamped / 60);
  const min = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function timeInputToMinutes(v: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function eventTimelineColorClass(eventId: string): string {
  let hash = 0;
  for (let i = 0; i < eventId.length; i++) {
    hash = (hash + eventId.charCodeAt(i)) % 997;
  }
  return EVENT_COLOR_CLASSES[hash % EVENT_COLOR_CLASSES.length]!;
}

export function currentMinutesOfDay(now = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}
