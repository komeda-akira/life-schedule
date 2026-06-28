import type { CalendarEvent, RecurrenceFreq, RecurrenceRule } from "@/lib/types";
import {
  isDateInEventSpan,
  materializeSpanDay,
  occurrenceStartForDate,
  spanLengthDays,
} from "@/lib/event-span";

export const RECURRENCE_FREQ_LABELS: Record<RecurrenceFreq, string> = {
  daily: "毎日",
  weekly: "毎週",
  monthly: "毎月",
  yearly: "毎年",
};

export const RECURRENCE_OPTIONS: { value: RecurrenceFreq | ""; label: string }[] =
  [
    { value: "", label: "繰り返しなし" },
    { value: "daily", label: "毎日" },
    { value: "weekly", label: "毎週" },
    { value: "monthly", label: "毎月" },
    { value: "yearly", label: "毎年" },
  ];

const INSTANCE_SEP = ":";

/** 繰り返し展開インスタンス ID（masterId:YYYY-MM-DD） */
export function instanceEventId(masterId: string, dateKey: string): string {
  return `${masterId}${INSTANCE_SEP}${dateKey}`;
}

export function parseInstanceEventId(
  id: string,
): { masterId: string; dateKey: string } | null {
  const i = id.lastIndexOf(INSTANCE_SEP);
  if (i <= 0) return null;
  const masterId = id.slice(0, i);
  const dateKey = id.slice(i + 1);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  return { masterId, dateKey };
}

export function isRecurrenceMaster(event: CalendarEvent): boolean {
  return Boolean(event.recurrence) && !event.recurrenceId;
}

export function isRecurrenceException(event: CalendarEvent): boolean {
  return Boolean(event.recurrenceId) && !event.recurrence;
}

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
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86_400_000);
}

function monthsBetween(start: Date, target: Date): number {
  return (
    (target.getFullYear() - start.getFullYear()) * 12 +
    (target.getMonth() - start.getMonth())
  );
}

function yearsBetween(start: Date, target: Date): number {
  return target.getFullYear() - start.getFullYear();
}

export function occursOnDate(
  master: CalendarEvent,
  dateKey: string,
): boolean {
  const rule = master.recurrence;
  if (!rule) return master.date === dateKey;

  const start = parseDateKey(master.date);
  const target = parseDateKey(dateKey);
  if (target < start) return false;

  if (rule.until) {
    const until = parseDateKey(rule.until);
    if (target > until) return false;
  }

  const interval = rule.interval ?? 1;

  switch (rule.freq) {
    case "daily": {
      const diff = daysBetween(start, target);
      return diff >= 0 && diff % interval === 0;
    }
    case "weekly": {
      const diff = daysBetween(start, target);
      return diff >= 0 && diff % (7 * interval) === 0;
    }
    case "monthly": {
      const diff = monthsBetween(start, target);
      if (diff < 0 || diff % interval !== 0) return false;
      return target.getDate() === start.getDate();
    }
    case "yearly": {
      const diff = yearsBetween(start, target);
      if (diff < 0 || diff % interval !== 0) return false;
      return (
        target.getMonth() === start.getMonth() &&
        target.getDate() === start.getDate()
      );
    }
    default:
      return false;
  }
}

export function materializeInstance(
  master: CalendarEvent,
  dateKey: string,
): CalendarEvent {
  return {
    ...master,
    id: instanceEventId(master.id, dateKey),
    date: dateKey,
    recurrence: undefined,
    recurrenceId: master.id,
    recurrenceSkipDates: undefined,
  };
}

/** 指定日に表示する予定（繰り返し展開・例外込み） */
export function eventsForDateExpanded(
  stored: CalendarEvent[],
  dateKey: string,
): CalendarEvent[] {
  const results: CalendarEvent[] = [];
  const exceptionByMasterDate = new Map<string, CalendarEvent>();

  for (const event of stored) {
    if (isRecurrenceException(event)) {
      exceptionByMasterDate.set(`${event.recurrenceId}:${event.date}`, event);
    }
  }

  for (const event of stored) {
    if (isRecurrenceException(event)) {
      if (event.date === dateKey) results.push(event);
      continue;
    }

    if (event.recurrence) {
      const skips = new Set(event.recurrenceSkipDates ?? []);
      if (skips.has(dateKey)) continue;

      const spanLen = spanLengthDays(event);
      if (spanLen === 0) {
        if (!occursOnDate(event, dateKey)) continue;
        const override = exceptionByMasterDate.get(`${event.id}:${dateKey}`);
        results.push(override ?? materializeInstance(event, dateKey));
        continue;
      }

      const occStart = occurrenceStartForDate(event, dateKey);
      if (!occStart || skips.has(occStart)) continue;
      const override = exceptionByMasterDate.get(`${event.id}:${dateKey}`);
      results.push(
        override ??
          materializeSpanDay(event, dateKey, occStart),
      );
      continue;
    }

    if (isDateInEventSpan(event, dateKey)) {
      results.push(materializeSpanDay(event, dateKey, event.date));
      continue;
    }

    if (event.date === dateKey) results.push(event);
  }

  return results;
}

/** タイトル・メモの部分一致検索 */
export function searchEventsInStore(
  stored: CalendarEvent[],
  query: string,
  limit = 50,
): CalendarEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: CalendarEvent[] = [];
  const seen = new Set<string>();

  const push = (event: CalendarEvent, matchDate: string) => {
    const key = `${event.id}|${matchDate}`;
    if (seen.has(key)) return;
    seen.add(key);
    hits.push({ ...event, date: matchDate });
    if (hits.length >= limit) return;
  };

  for (const event of stored) {
    const hay = `${event.title} ${event.memo ?? ""}`.toLowerCase();
    if (!hay.includes(q)) continue;

    if (event.recurrence && !event.recurrenceId) {
      const spanLen = spanLengthDays(event);
      const start = parseDateKey(event.date);
      const end = addDays(start, 365 + spanLen);
      for (let d = new Date(start); d <= end && hits.length < limit; d = addDays(d, 1)) {
        const dk = formatDateKeyLocal(d);
        if (spanLen === 0) {
          if (occursOnDate(event, dk)) {
            push(materializeInstance(event, dk), dk);
          }
          continue;
        }
        const occStart = occurrenceStartForDate(event, dk);
        if (occStart) {
          push(materializeSpanDay(event, dk, occStart), dk);
        }
      }
    } else {
      if (isDateInEventSpan(event, event.date)) {
        push(materializeSpanDay(event, event.date, event.date), event.date);
      } else {
        push(event, event.date);
      }
    }
  }

  return hits.sort((a, b) => a.date.localeCompare(b.date));
}

export function normalizeRecurrenceRule(raw: unknown): RecurrenceRule | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Partial<RecurrenceRule>;
  const freq = r.freq;
  if (
    freq !== "daily" &&
    freq !== "weekly" &&
    freq !== "monthly" &&
    freq !== "yearly"
  ) {
    return undefined;
  }
  const interval =
    typeof r.interval === "number" && r.interval >= 1 && r.interval <= 99
      ? Math.round(r.interval)
      : 1;
  const until =
    typeof r.until === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.until)
      ? r.until
      : undefined;
  return { freq, interval, until };
}

export function defaultRecurrenceUntil(startDateKey: string): string {
  const d = parseDateKey(startDateKey);
  d.setFullYear(d.getFullYear() + 1);
  return formatDateKeyLocal(d);
}
