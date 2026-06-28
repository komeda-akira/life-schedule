import type { CalendarEvent } from "@/lib/types";
import {
  occursOnDate,
  instanceEventId,
  parseInstanceEventId,
} from "@/lib/recurrence";

const DAY_MINUTES = 24 * 60;

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y!, m! - 1, d);
}

function formatDateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** 複数日予定の終了日（含む）。単日なら開始日と同じ */
export function eventSpanEndDate(event: CalendarEvent): string {
  if (!event.endDate || event.endDate < event.date) return event.date;
  return event.endDate;
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  return eventSpanEndDate(event) > event.date;
}

export function spanLengthDays(event: CalendarEvent): number {
  return daysBetween(parseDateKey(event.date), parseDateKey(eventSpanEndDate(event)));
}

export function isDateInEventSpan(
  event: CalendarEvent,
  dateKey: string,
): boolean {
  const end = eventSpanEndDate(event);
  return dateKey >= event.date && dateKey <= end;
}

function resolveMaster(
  event: CalendarEvent,
  stored: CalendarEvent[],
): CalendarEvent {
  const parsed = parseInstanceEventId(event.id);
  if (parsed) {
    return stored.find((e) => e.id === parsed.masterId) ?? event;
  }
  if (event.recurrenceId) {
    return stored.find((e) => e.id === event.recurrenceId) ?? event;
  }
  return event;
}

/** 繰り返し＋複数日: 表示日が属する occurrence の開始日 */
export function occurrenceStartForDate(
  master: CalendarEvent,
  dateKey: string,
): string | null {
  const spanLen = spanLengthDays(master);
  if (!master.recurrence) {
    return isDateInEventSpan(master, dateKey) ? master.date : null;
  }
  if (spanLen === 0) {
    return occursOnDate(master, dateKey) ? dateKey : null;
  }
  const target = parseDateKey(dateKey);
  for (let back = 0; back <= spanLen; back++) {
    const start = addDays(target, -back);
    const startKey = formatDateKeyLocal(start);
    if (!occursOnDate(master, startKey)) continue;
    const end = addDays(start, spanLen);
    if (target >= start && target <= end) return startKey;
  }
  return null;
}

export function resolveEventSpanBounds(
  event: CalendarEvent | null,
  stored: CalendarEvent[],
  fallbackDateKey: string,
): { startDate: string; endDate: string } {
  if (!event) {
    return { startDate: fallbackDateKey, endDate: fallbackDateKey };
  }
  const master = resolveMaster(event, stored);
  const parsed = parseInstanceEventId(event.id);
  const spanLen = spanLengthDays(master);

  if (master.recurrence && spanLen > 0) {
    const occStart =
      occurrenceStartForDate(master, event.date) ??
      parsed?.dateKey ??
      master.date;
    const occEnd = formatDateKeyLocal(
      addDays(parseDateKey(occStart), spanLen),
    );
    return { startDate: occStart, endDate: occEnd };
  }

  if (parsed && spanLen > 0) {
    const occStart =
      occurrenceStartForDate(master, parsed.dateKey) ?? parsed.dateKey;
    const occEnd = formatDateKeyLocal(
      addDays(parseDateKey(occStart), spanLen),
    );
    return { startDate: occStart, endDate: occEnd };
  }

  return {
    startDate: master.date,
    endDate: eventSpanEndDate(master),
  };
}

/** 指定日に表示する1日分の予定へ展開 */
export function materializeSpanDay(
  event: CalendarEvent,
  dateKey: string,
  occurrenceStart: string,
): CalendarEvent {
  const spanLen = spanLengthDays(event);
  const dayIndex = daysBetween(parseDateKey(occurrenceStart), parseDateKey(dateKey));
  const parsed = parseInstanceEventId(event.id);
  const masterId = parsed?.masterId ?? event.recurrenceId ?? event.id;
  const isRecurring = Boolean(event.recurrence || event.recurrenceId || parsed);

  const base: CalendarEvent = {
    ...event,
    id: isRecurring ? instanceEventId(masterId, dateKey) : event.id,
    date: dateKey,
    recurrence: undefined,
    recurrenceSkipDates: undefined,
    recurrenceId: event.recurrence ? masterId : event.recurrenceId,
    endDate: formatDateKeyLocal(
      addDays(parseDateKey(occurrenceStart), spanLen),
    ),
  };

  if (spanLen === 0) return base;

  if (event.kind === "allDay") return base;

  if (dayIndex === 0 && dayIndex === spanLen) {
    return base;
  }
  if (dayIndex === 0) {
    return {
      ...base,
      startMin: event.startMin,
      endMin: DAY_MINUTES - 1,
    };
  }
  if (dayIndex === spanLen) {
    return {
      ...base,
      startMin: 0,
      endMin: event.endMin,
    };
  }
  return {
    ...base,
    kind: "allDay",
    startMin: undefined,
    endMin: undefined,
  };
}

export function formatEventDateRange(event: CalendarEvent): string {
  const end = eventSpanEndDate(event);
  if (end === event.date) return event.date;
  return `${event.date} 〜 ${end}`;
}

export function normalizeEventEndDate(
  startDate: string,
  endDate: string,
): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return undefined;
  if (endDate <= startDate) return undefined;
  return endDate;
}
