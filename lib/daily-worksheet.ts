import { formatWeekdayJa } from "@/lib/calendar";
import { formatDateKey } from "@/lib/scope-keys";
import type { AppData } from "@/lib/types";

export function formatDailySheetTitle(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()} (${formatWeekdayJa(d)})`;
}

export function formatYearRemainingLabel(d: Date): string {
  const year = d.getFullYear();
  const end = new Date(year, 11, 31);
  end.setHours(0, 0, 0, 0);
  const cur = new Date(d);
  cur.setHours(0, 0, 0, 0);
  const remaining = Math.max(
    0,
    Math.ceil((end.getTime() - cur.getTime()) / 86400000) + 1,
  );
  return `${year}\u5e74 \u6b8b\u308a${remaining}\u65e5`;
}

export const DAILY_TODO_ROW_COUNT = 12;
export const DAILY_MONEY_ROW_COUNT = 4;
export const DAILY_MEAL_GROUP_COUNT = 4;
export const DAILY_SCHEDULE_START_HOUR = 5;
export const DAILY_SCHEDULE_END_HOUR = 24;

export type DailyTodoRow = {
  checked: boolean;
  priority: string;
  task: string;
  time: string;
};

export type DailyScheduleRow = {
  planned: string;
  result: string;
};

export type DailyMealRow = {
  checks: boolean[];
};

export type DailyMoneyRow = {
  item: string;
  amount: string;
};

export type DailyWorksheet = {
  topPriorityGoals: [string, string];
  todos: DailyTodoRow[];
  memo: string;
  meals: DailyMealRow[];
  moneyRows: DailyMoneyRow[];
  ownerName: string;
  headerQuote: string;
  schedule: DailyScheduleRow[];
};

export function dayWorksheetKey(d: Date): string {
  return `day:${formatDateKey(d)}`;
}

export function parseDayWorksheetKey(
  key: string,
): { year: number; month: number; day: number } | null {
  const m = /^day:(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return { year, month, day };
}

function emptyMealRow(): DailyMealRow {
  return {
    checks: Array.from({ length: DAILY_MEAL_GROUP_COUNT }, () => false),
  };
}

function emptyTodos(): DailyTodoRow[] {
  return Array.from({ length: DAILY_TODO_ROW_COUNT }, () => ({
    checked: false,
    priority: "",
    task: "",
    time: "",
  }));
}

function emptySchedule(): DailyScheduleRow[] {
  const count = DAILY_SCHEDULE_END_HOUR - DAILY_SCHEDULE_START_HOUR + 1;
  return Array.from({ length: count }, () => ({
    planned: "",
    result: "",
  }));
}

export function createEmptyDailyWorksheet(): DailyWorksheet {
  return {
    topPriorityGoals: ["", ""],
    todos: emptyTodos(),
    memo: "",
    meals: [emptyMealRow(), emptyMealRow(), emptyMealRow()],
    moneyRows: Array.from({ length: DAILY_MONEY_ROW_COUNT }, () => ({
      item: "",
      amount: "",
    })),
    ownerName: "",
    headerQuote: "",
    schedule: emptySchedule(),
  };
}

function mergeStr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeTodos(input: unknown, base: DailyTodoRow[]): DailyTodoRow[] {
  if (!Array.isArray(input)) return base.map((r) => ({ ...r }));
  return Array.from({ length: DAILY_TODO_ROW_COUNT }, (_, i) => {
    const row = input[i];
    const b = base[i];
    if (!row || typeof row !== "object") return { ...b };
    const r = row as Partial<DailyTodoRow>;
    return {
      checked: typeof r.checked === "boolean" ? r.checked : b.checked,
      priority: mergeStr(r.priority, b.priority),
      task: mergeStr(r.task, b.task),
      time: mergeStr(r.time, b.time),
    };
  });
}

function normalizeMeals(input: unknown, base: DailyMealRow[]): DailyMealRow[] {
  if (!Array.isArray(input)) return base.map((r) => ({ checks: [...r.checks] }));
  return Array.from({ length: 3 }, (_, i) => {
    const row = input[i];
    const b = base[i] ?? emptyMealRow();
    if (!row || typeof row !== "object") return { checks: [...b.checks] };
    const checks = (row as DailyMealRow).checks;
    if (!Array.isArray(checks)) return { checks: [...b.checks] };
    return {
      checks: Array.from({ length: DAILY_MEAL_GROUP_COUNT }, (_, j) =>
        typeof checks[j] === "boolean" ? checks[j] : b.checks[j],
      ),
    };
  });
}

function normalizeSchedule(
  input: unknown,
  base: DailyScheduleRow[],
): DailyScheduleRow[] {
  if (!Array.isArray(input)) return base.map((r) => ({ ...r }));
  return Array.from({ length: base.length }, (_, i) => {
    const row = input[i];
    const b = base[i];
    if (!row || typeof row !== "object") return { ...b };
    const r = row as Partial<DailyScheduleRow>;
    return {
      planned: mergeStr(r.planned, b.planned),
      result: mergeStr(r.result, b.result),
    };
  });
}

export function normalizeDailyWorksheet(
  input?: Partial<DailyWorksheet> | null,
): DailyWorksheet {
  const base = createEmptyDailyWorksheet();
  if (!input) return base;

  const topPriorityGoals: [string, string] = [
    mergeStr(input.topPriorityGoals?.[0], base.topPriorityGoals[0]),
    mergeStr(input.topPriorityGoals?.[1], base.topPriorityGoals[1]),
  ];

  return {
    topPriorityGoals,
    todos: normalizeTodos(input.todos, base.todos),
    memo: mergeStr(input.memo, base.memo),
    meals: normalizeMeals(input.meals, base.meals),
    moneyRows: Array.from({ length: DAILY_MONEY_ROW_COUNT }, (_, i) => {
      const row = input.moneyRows?.[i];
      const b = base.moneyRows[i];
      if (!row || typeof row !== "object") return { ...b };
      const r = row as Partial<DailyMoneyRow>;
      return {
        item: mergeStr(r.item, b.item),
        amount: mergeStr(r.amount, b.amount),
      };
    }),
    ownerName: mergeStr(input.ownerName, base.ownerName),
    headerQuote: mergeStr(input.headerQuote, base.headerQuote),
    schedule: normalizeSchedule(input.schedule, base.schedule),
  };
}

export function normalizeDailyWorksheets(
  input: unknown,
): Record<string, DailyWorksheet> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, DailyWorksheet> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!parseDayWorksheetKey(key)) continue;
    out[key] = normalizeDailyWorksheet(value as Partial<DailyWorksheet>);
  }
  return out;
}

export function dailyWorksheetExcerpt(ws: DailyWorksheet): string {
  for (const g of ws.topPriorityGoals) {
    const t = g.trim();
    if (t) return t;
  }
  for (const row of ws.todos) {
    if (row.task.trim()) return row.task.trim();
  }
  return "";
}

export function applyDailyWorksheetDefaults(data: AppData): AppData {
  return {
    ...data,
    dailyWorksheets: normalizeDailyWorksheets(data.dailyWorksheets),
  };
}
