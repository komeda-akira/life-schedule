import type { AppData } from "@/lib/types";

export const MONTHLY_GOAL_ROW_COUNT = 8;
export const MONTHLY_SUB_GOAL_COUNT = 6;
export const MONTHLY_ACTION_ROW_COUNT = 30;
export const MONTHLY_DAY_COLUMNS = 31;

export type MonthlyGoalRow = {
  goal: string;
  status: string;
};

export type MonthlyActionRow = {
  theme: string;
  successPoint: string;
  dayChecks: boolean[];
  outcomeImage: string;
};

export type MonthlyWorksheet = {
  createdDate: string;
  reflectionGoals: MonthlyGoalRow[];
  wentWell: string;
  wentPoorly: string;
  poorMindset: string;
  improvement: string;
  nextMonthPlan: string;
  topPriorityGoal: string;
  monthlyGoals: string[];
  actionRows: MonthlyActionRow[];
};

function emptyGoalRows(): MonthlyGoalRow[] {
  return Array.from({ length: MONTHLY_GOAL_ROW_COUNT }, () => ({
    goal: "",
    status: "",
  }));
}

function emptyDayChecks(): boolean[] {
  return Array.from({ length: MONTHLY_DAY_COLUMNS }, () => false);
}

function emptyActionRows(): MonthlyActionRow[] {
  return Array.from({ length: MONTHLY_ACTION_ROW_COUNT }, () => ({
    theme: "",
    successPoint: "",
    dayChecks: emptyDayChecks(),
    outcomeImage: "",
  }));
}

export function createEmptyMonthlyWorksheet(
  year: number,
  month: number,
): MonthlyWorksheet {
  return {
    createdDate: `${year}\u5e74${month}\u6708`,
    reflectionGoals: emptyGoalRows(),
    wentWell: "",
    wentPoorly: "",
    poorMindset: "",
    improvement: "",
    nextMonthPlan: "",
    topPriorityGoal: "",
    monthlyGoals: Array.from({ length: MONTHLY_SUB_GOAL_COUNT }, () => ""),
    actionRows: emptyActionRows(),
  };
}

export function parseMonthKey(
  key: string,
): { year: number; month: number } | null {
  const m = /^month:(\d{4})-(\d{2})$/.exec(key);
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year: Number(m[1]), month };
}

function mergeStr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeGoalRows(
  input: unknown,
  base: MonthlyGoalRow[],
): MonthlyGoalRow[] {
  if (!Array.isArray(input)) return base.map((r) => ({ ...r }));
  return Array.from({ length: MONTHLY_GOAL_ROW_COUNT }, (_, i) => {
    const row = input[i];
    if (!row || typeof row !== "object") return { ...base[i] };
    const r = row as Partial<MonthlyGoalRow>;
    return {
      goal: mergeStr(r.goal, base[i].goal),
      status: mergeStr(r.status, base[i].status),
    };
  });
}

function normalizeDayChecks(input: unknown, base: boolean[]): boolean[] {
  if (!Array.isArray(input)) return [...base];
  return Array.from({ length: MONTHLY_DAY_COLUMNS }, (_, i) =>
    typeof input[i] === "boolean" ? input[i] : base[i],
  );
}

function normalizeActionRows(
  input: unknown,
  base: MonthlyActionRow[],
): MonthlyActionRow[] {
  if (!Array.isArray(input)) return base.map((r) => ({ ...r, dayChecks: [...r.dayChecks] }));
  return Array.from({ length: MONTHLY_ACTION_ROW_COUNT }, (_, i) => {
    const row = input[i];
    const baseRow = base[i];
    if (!row || typeof row !== "object") {
      return { ...baseRow, dayChecks: [...baseRow.dayChecks] };
    }
    const r = row as Partial<MonthlyActionRow>;
    return {
      theme: mergeStr(r.theme, baseRow.theme),
      successPoint: mergeStr(r.successPoint, baseRow.successPoint),
      dayChecks: normalizeDayChecks(r.dayChecks, baseRow.dayChecks),
      outcomeImage: mergeStr(r.outcomeImage, baseRow.outcomeImage),
    };
  });
}

export function normalizeMonthlyWorksheet(
  input: Partial<MonthlyWorksheet> | null | undefined,
  year: number,
  month: number,
): MonthlyWorksheet {
  const base = createEmptyMonthlyWorksheet(year, month);
  if (!input) return base;

  return {
    createdDate: mergeStr(input.createdDate, base.createdDate),
    reflectionGoals: normalizeGoalRows(input.reflectionGoals, base.reflectionGoals),
    wentWell: mergeStr(input.wentWell, base.wentWell),
    wentPoorly: mergeStr(input.wentPoorly, base.wentPoorly),
    poorMindset: mergeStr(input.poorMindset, base.poorMindset),
    improvement: mergeStr(input.improvement, base.improvement),
    nextMonthPlan: mergeStr(input.nextMonthPlan, base.nextMonthPlan),
    topPriorityGoal: mergeStr(input.topPriorityGoal, base.topPriorityGoal),
    monthlyGoals: Array.from({ length: MONTHLY_SUB_GOAL_COUNT }, (_, i) =>
      mergeStr(input.monthlyGoals?.[i], base.monthlyGoals[i] ?? ""),
    ),
    actionRows: normalizeActionRows(input.actionRows, base.actionRows),
  };
}

export function monthlyWorksheetExcerpt(ws: MonthlyWorksheet): string {
  const top = ws.topPriorityGoal.trim();
  if (top) return top;
  for (const g of ws.monthlyGoals) {
    const t = g.trim();
    if (t) return t;
  }
  for (const r of ws.reflectionGoals) {
    const t = r.goal.trim();
    if (t) return t;
  }
  return "";
}

export function normalizeMonthlyWorksheets(
  input: unknown,
): Record<string, MonthlyWorksheet> {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, MonthlyWorksheet> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const parts = parseMonthKey(key);
    if (!parts) continue;
    out[key] = normalizeMonthlyWorksheet(
      value as Partial<MonthlyWorksheet>,
      parts.year,
      parts.month,
    );
  }
  return out;
}

export function applyMonthlyWorksheetDefaults(data: AppData): AppData {
  return {
    ...data,
    monthlyWorksheets: normalizeMonthlyWorksheets(data.monthlyWorksheets),
  };
}
