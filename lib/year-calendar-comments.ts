import { createDefaultPlan, yearPlanSummaryExcerpt } from "@/lib/mid-long-term-plan";
import { monthlyWorksheetExcerpt, normalizeMonthlyWorksheet } from "@/lib/monthly-worksheet";
import { weekKey } from "@/lib/scope-keys";
import { listWeeksInMonth } from "@/lib/week-in-month";
import type { AppData } from "@/lib/types";
import {
  mondayFromWeekKey,
  parseWeekKey,
  weeklyWorksheetExcerpt,
} from "@/lib/weekly-worksheet";

export type WeekCommentNode = {
  weekKey: string;
  label: string;
  scopeComment: string;
  sheetExcerpt: string;
};

export type MonthCommentNode = {
  month: number;
  label: string;
  scopeComment: string;
  sheetExcerpt: string;
  weeks: WeekCommentNode[];
};

export type YearCommentDigest = {
  year: number;
  yearScopeComment: string;
  planSummary: string;
  months: MonthCommentNode[];
  entryCount: number;
};

function weekDisplayLabel(monday: Date): string {
  const y = monday.getFullYear();
  const m = monday.getMonth() + 1;
  const wk = weekKey(monday);
  const weeks = listWeeksInMonth(y, m);
  const match = weeks.find((w) => weekKey(w.monday) === wk);
  if (match) {
    return `${m}月 ${match.label}（${match.rangeLabel}）`;
  }
  return wk.replace(/^week:/, "");
}

function countEntries(digest: Omit<YearCommentDigest, "entryCount">): number {
  let n = 0;
  if (digest.yearScopeComment) n += 1;
  if (digest.planSummary) n += 1;
  for (const month of digest.months) {
    if (month.scopeComment) n += 1;
    if (month.sheetExcerpt) n += 1;
    for (const week of month.weeks) {
      if (week.scopeComment) n += 1;
      if (week.sheetExcerpt) n += 1;
    }
  }
  return n;
}

export function buildYearCommentDigest(
  data: AppData,
  year: number,
): YearCommentDigest {
  const scopeComments = data.scopeComments ?? {};
  const yearScopeComment = (scopeComments[`year:${year}`] ?? "").trim();
  const plan = data.midLongTermPlan ?? createDefaultPlan();
  const planSummary = yearPlanSummaryExcerpt(plan, year, 200).trim();

  const weekByMonth = new Map<number, WeekCommentNode[]>();

  for (const [key, raw] of Object.entries(scopeComments)) {
    if (!key.startsWith("week:")) continue;
    const scopeComment = raw.trim();
    if (!scopeComment) continue;

    const parsed = parseWeekKey(key);
    if (!parsed || parsed.year !== year) continue;

    const monday = mondayFromWeekKey(key);
    if (!monday) continue;

    const month = monday.getMonth() + 1;
    const sheet = data.weeklyWorksheets?.[key];
    const sheetExcerpt = sheet ? weeklyWorksheetExcerpt(sheet).trim() : "";

    const node: WeekCommentNode = {
      weekKey: key,
      label: weekDisplayLabel(monday),
      scopeComment,
      sheetExcerpt,
    };

    const list = weekByMonth.get(month) ?? [];
    list.push(node);
    weekByMonth.set(month, list);
  }

  for (const [key, sheet] of Object.entries(data.weeklyWorksheets ?? {})) {
    if (!key.startsWith("week:")) continue;
    if (scopeComments[key]?.trim()) continue;

    const parsed = parseWeekKey(key);
    if (!parsed || parsed.year !== year) continue;

    const monday = mondayFromWeekKey(key);
    if (!monday) continue;

    const sheetExcerpt = weeklyWorksheetExcerpt(sheet).trim();
    if (!sheetExcerpt) continue;

    const month = monday.getMonth() + 1;
    const node: WeekCommentNode = {
      weekKey: key,
      label: weekDisplayLabel(monday),
      scopeComment: "",
      sheetExcerpt,
    };

    const list = weekByMonth.get(month) ?? [];
    list.push(node);
    weekByMonth.set(month, list);
  }

  const months: MonthCommentNode[] = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const mk = `month:${year}-${String(month).padStart(2, "0")}`;
    const scopeComment = (scopeComments[mk] ?? "").trim();

    const sheetRaw = data.monthlyWorksheets?.[mk];
    const sheetExcerpt = sheetRaw
      ? monthlyWorksheetExcerpt(
          normalizeMonthlyWorksheet(sheetRaw, year, month),
        ).trim()
      : "";

    const weeks = (weekByMonth.get(month) ?? []).sort((a, b) =>
      a.weekKey.localeCompare(b.weekKey),
    );

    return {
      month,
      label: `${month}月`,
      scopeComment,
      sheetExcerpt,
      weeks,
    };
  });

  const base = { year, yearScopeComment, planSummary, months };
  return { ...base, entryCount: countEntries(base) };
}
