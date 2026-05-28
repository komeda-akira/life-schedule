import type { AppData } from "@/lib/types";

export const MY_100_YEAR_HISTORY_LABEL = "\u81ea\u5206 100\u5e74\u53f2";

export const MY_100_YEAR_HISTORY_EXCERPT =
  "\u4eba\u751f\u306e\u5e74\u8868\u3092\u7de8\u96c6";

export const MY_100_YEAR_AGE_COUNT = 100;

export const MY_100_YEAR_HISTORY_COLUMNS = [
  { start: 1, end: 25 },
  { start: 26, end: 50 },
  { start: 51, end: 75 },
  { start: 76, end: 100 },
] as const;

export const MY_100_YEAR_CREATED_LABEL = "\u4f5c\u6210";

export const MY_100_YEAR_SAVE_HINT =
  "\u5165\u529b\u5185\u5bb9\u306f\u81ea\u52d5\u4fdd\u5b58\u3055\u308c\u307e\u3059\u3002";

export const MY_100_YEAR_CURRENT_AGE_LABEL = "\u73fe\u5728\u306e\u5e74\u9f62";

export type My100YearHistory = {
  createdYear: string;
  createdMonth: string;
  createdDay: string;
  /** index 0 = 1\u6b73 */
  entries: string[];
  highlightAge: number;
};

function createDefaultEntries(): string[] {
  const entries = Array<string>(MY_100_YEAR_AGE_COUNT).fill("");
  entries[35] = "CPA\u5408\u683c \u3042\u305a\u3055\u5165\u793e";
  entries[38] = "\u697d\u5929\u5165\u793e";
  return entries;
}

export const DEFAULT_MY_100_YEAR_HISTORY: My100YearHistory = {
  createdYear: "",
  createdMonth: "",
  createdDay: "",
  entries: createDefaultEntries(),
  highlightAge: 45,
};

function mergeStr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeEntries(input: unknown, base: string[]): string[] {
  if (!Array.isArray(input)) return [...base];
  return Array.from({ length: MY_100_YEAR_AGE_COUNT }, (_, i) =>
    mergeStr(input[i], base[i] ?? ""),
  );
}

function normalizeHighlightAge(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MY_100_YEAR_AGE_COUNT, Math.max(1, Math.round(n)));
}

export function normalizeMy100YearHistory(
  input?: Partial<My100YearHistory> | null,
): My100YearHistory {
  const base = DEFAULT_MY_100_YEAR_HISTORY;
  if (!input) return { ...base, entries: [...base.entries] };

  return {
    createdYear: mergeStr(input.createdYear, base.createdYear),
    createdMonth: mergeStr(input.createdMonth, base.createdMonth),
    createdDay: mergeStr(input.createdDay, base.createdDay),
    entries: normalizeEntries(input.entries, base.entries),
    highlightAge: normalizeHighlightAge(input.highlightAge, base.highlightAge),
  };
}

export function applyMy100YearHistoryDefaults(data: AppData): AppData {
  return {
    ...data,
    my100YearHistory: normalizeMy100YearHistory(data.my100YearHistory),
  };
}
