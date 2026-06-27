/** 日次タイムライン（Google カレンダー風）の共通定数・ユーティリティ */

export const TIMELINE_SNAP_MINUTES = 15;
export const TIMELINE_DEFAULT_DURATION_MIN = 60;
export const TIMELINE_MIN_DURATION_MIN = 15;

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
  return Math.min(24 * 60, Math.max(0, snapped));
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
  const a = snapTimelineMinutes(Math.min(startMin, endMin));
  let b = snapTimelineMinutes(Math.max(startMin, endMin));
  if (b <= a) {
    b = Math.min(24 * 60, a + TIMELINE_DEFAULT_DURATION_MIN);
  }
  if (b - a < TIMELINE_MIN_DURATION_MIN) {
    b = Math.min(24 * 60, a + TIMELINE_MIN_DURATION_MIN);
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
  const duration = originEndMin - originStartMin;

  if (mode === "move") {
    let startMin = snapTimelineMinutes(pointerMin - grabOffsetMin);
    startMin = Math.max(0, Math.min(24 * 60 - duration, startMin));
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
  endMin = Math.min(24 * 60, endMin);
  return { startMin: originStartMin, endMin };
}

export function formatMinutesClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function formatMinutesRange(startMin: number, endMin: number): string {
  return `${formatMinutesClock(startMin)} – ${formatMinutesClock(endMin)}`;
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
