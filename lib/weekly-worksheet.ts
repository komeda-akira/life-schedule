import { addDays } from "@/lib/calendar";
import { getMonday } from "@/lib/calendar";
import type { AppData } from "@/lib/types";
import { weekKey } from "@/lib/scope-keys";

export const WEEKLY_SCHEDULE_START_HOUR = 5;
export const WEEKLY_SCHEDULE_END_HOUR = 24;
export const WEEKLY_DAY_COUNT = 7;

export const WEEKLY_HOUR_ROW_COUNT =
  WEEKLY_SCHEDULE_END_HOUR - WEEKLY_SCHEDULE_START_HOUR + 1;

export type WeeklyDayColumn = {
  dateLabel: string;
  hours: string[];
};

export type WeeklyWorksheet = {
  dateRangeStart: string;
  dateRangeEnd: string;
  topPriorityGoal: string;
  weeklyGoals: string;
  days: WeeklyDayColumn[];
  memoHours: string[];
  footerNotes: string;
};

function emptyHours(): string[] {
  return Array.from({ length: WEEKLY_HOUR_ROW_COUNT }, () => "");
}

function emptyDayColumn(): WeeklyDayColumn {
  return { dateLabel: "", hours: emptyHours() };
}

export function createEmptyWeeklyWorksheet(): WeeklyWorksheet {
  return {
    dateRangeStart: "",
    dateRangeEnd: "",
    topPriorityGoal: "",
    weeklyGoals: "",
    days: Array.from({ length: WEEKLY_DAY_COUNT }, () => emptyDayColumn()),
    memoHours: emptyHours(),
    footerNotes: "",
  };
}

export function parseWeekKey(
  key: string,
): { year: number; week: number } | null {
  const m = /^week:(\d{4})-W(\d{2})$/.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (week < 1 || week > 53) return null;
  return { year, week };
}

/** ISO週の月曜 0:00 */
export function mondayFromISOWeek(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  jan4.setHours(0, 0, 0, 0);
  const week1Monday = getMonday(jan4);
  return addDays(week1Monday, (week - 1) * 7);
}

export function mondayFromWeekKey(key: string): Date | null {
  const parsed = parseWeekKey(key);
  if (!parsed) return null;
  return mondayFromISOWeek(parsed.year, parsed.week);
}

export const WEEKLY_TIMELINE_ROW_PX = 32;

export const WEEKLY_TIMELINE_HEIGHT =
  WEEKLY_HOUR_ROW_COUNT * WEEKLY_TIMELINE_ROW_PX;

export const WEEKLY_TIMELINE_START_MIN = WEEKLY_SCHEDULE_START_HOUR * 60;

export const WEEKLY_TIMELINE_END_MIN = WEEKLY_SCHEDULE_END_HOUR * 60;

export function scheduleHourLabel(rowIndex: number): number {
  return WEEKLY_SCHEDULE_START_HOUR + rowIndex;
}

function mergeStr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeHours(input: unknown, base: string[]): string[] {
  if (!Array.isArray(input)) return [...base];
  return Array.from({ length: WEEKLY_HOUR_ROW_COUNT }, (_, i) =>
    mergeStr(input[i], base[i] ?? ""),
  );
}

function normalizeDays(
  input: unknown,
  base: WeeklyDayColumn[],
): WeeklyDayColumn[] {
  if (!Array.isArray(input)) return base.map((d) => ({ ...d, hours: [...d.hours] }));
  return Array.from({ length: WEEKLY_DAY_COUNT }, (_, i) => {
    const row = input[i];
    const b = base[i] ?? emptyDayColumn();
    if (!row || typeof row !== "object") return { ...b, hours: [...b.hours] };
    const r = row as Partial<WeeklyDayColumn>;
    return {
      dateLabel: mergeStr(r.dateLabel, b.dateLabel),
      hours: normalizeHours(r.hours, b.hours),
    };
  });
}

export function applyWeeklyDateDefaults(
  ws: WeeklyWorksheet,
  monday: Date,
): WeeklyWorksheet {
  const start = startOfDayLocal(monday);
  const end = addDays(start, 6);
  const days = ws.days.map((day, i) => {
    const d = addDays(start, i);
    const defaultLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    return {
      ...day,
      dateLabel: day.dateLabel.trim() ? day.dateLabel : defaultLabel,
    };
  });
  return {
    ...ws,
    days,
    dateRangeStart: ws.dateRangeStart.trim()
      ? ws.dateRangeStart
      : `${start.getMonth() + 1}月${start.getDate()}日`,
    dateRangeEnd: ws.dateRangeEnd.trim()
      ? ws.dateRangeEnd
      : `${end.getMonth() + 1}月${end.getDate()}日`,
  };
}

function startOfDayLocal(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function normalizeWeeklyWorksheet(
  input?: Partial<WeeklyWorksheet> | null,
  monday?: Date | null,
): WeeklyWorksheet {
  const base = createEmptyWeeklyWorksheet();
  if (!input) {
    return monday ? applyWeeklyDateDefaults(base, monday) : base;
  }

  const ws: WeeklyWorksheet = {
    dateRangeStart: mergeStr(input.dateRangeStart, base.dateRangeStart),
    dateRangeEnd: mergeStr(input.dateRangeEnd, base.dateRangeEnd),
    topPriorityGoal: mergeStr(input.topPriorityGoal, base.topPriorityGoal),
    weeklyGoals: mergeStr(input.weeklyGoals, base.weeklyGoals),
    days: normalizeDays(input.days, base.days),
    memoHours: normalizeHours(input.memoHours, base.memoHours),
    footerNotes: mergeStr(input.footerNotes, base.footerNotes),
  };

  return monday ? applyWeeklyDateDefaults(ws, monday) : ws;
}

export function normalizeWeeklyWorksheets(
  input: unknown,
): Record<string, WeeklyWorksheet> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, WeeklyWorksheet> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!parseWeekKey(key)) continue;
    const monday = mondayFromWeekKey(key);
    out[key] = normalizeWeeklyWorksheet(
      value as Partial<WeeklyWorksheet>,
      monday,
    );
  }
  return out;
}

export function weeklyWorksheetExcerpt(ws: WeeklyWorksheet): string {
  const top = ws.topPriorityGoal.trim();
  if (top) return top;
  const goals = ws.weeklyGoals.trim();
  if (goals) return goals.split("\n")[0]?.trim() ?? goals;
  for (const day of ws.days) {
    for (const cell of day.hours) {
      const t = cell.trim();
      if (t) return t;
    }
  }
  return "";
}

export function applyWeeklyWorksheetDefaults(data: AppData): AppData {
  return {
    ...data,
    weeklyWorksheets: normalizeWeeklyWorksheets(data.weeklyWorksheets),
  };
}

export function worksheetKeyForMonday(monday: Date): string {
  return weekKey(monday);
}
