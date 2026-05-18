import { excerptComment, YEAR_PANE_MIN } from "@/lib/calendar";

/** 0 = 年間サマリー行、1〜7 = テーマ行 */
export const PLAN_SUMMARY_ROW_INDEX = 0;
export const PLAN_THEME_ROW_COUNT = 7;
export const PLAN_ROW_COUNT = PLAN_THEME_ROW_COUNT + 1;
export const PLAN_SUB_ROW_COUNT = 4;
export const PLAN_YEAR_COLUMN_COUNT = 10;

export type PlanCell = [string, string, string, string];

export type MidLongTermPlanRow = {
  theme: PlanCell;
  successPoint: PlanCell;
  years: PlanCell[];
  outcome: PlanCell;
};

export type MidLongTermPlan = {
  startYear: number;
  endYear: number;
  createdAt: string;
  priorityGoal: string;
  goals: [string, string, string, string, string, string];
  /** テーマ行1〜7の見出し（任意で編集） */
  themeRowLabels: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  rows: MidLongTermPlanRow[];
};

export type CellColumnKind = "theme" | "success" | "year" | "outcome";

export function createEmptyCell(): PlanCell {
  return ["", "", "", ""];
}

export function createEmptyRow(): MidLongTermPlanRow {
  return {
    theme: createEmptyCell(),
    successPoint: createEmptyCell(),
    years: Array.from({ length: PLAN_YEAR_COLUMN_COUNT }, () =>
      createEmptyCell(),
    ),
    outcome: createEmptyCell(),
  };
}

export function defaultThemeRowLabels(): MidLongTermPlan["themeRowLabels"] {
  return [
    "\u30c6\u30fc\u30de1",
    "\u30c6\u30fc\u30de2",
    "\u30c6\u30fc\u30de3",
    "\u30c6\u30fc\u30de4",
    "\u30c6\u30fc\u30de5",
    "\u30c6\u30fc\u30de6",
    "\u30c6\u30fc\u30de7",
  ];
}

export function createDefaultPlan(
  startYear = YEAR_PANE_MIN,
): MidLongTermPlan {
  return {
    startYear,
    endYear: startYear + PLAN_YEAR_COLUMN_COUNT - 1,
    createdAt: new Date().toISOString(),
    priorityGoal: "",
    goals: ["", "", "", "", "", ""],
    themeRowLabels: defaultThemeRowLabels(),
    rows: Array.from({ length: PLAN_ROW_COUNT }, () => createEmptyRow()),
  };
}

export function planYearLabels(plan: MidLongTermPlan): number[] {
  return Array.from(
    { length: PLAN_YEAR_COLUMN_COUNT },
    (_, i) => plan.startYear + i,
  );
}

export function isSummaryRow(rowIndex: number): boolean {
  return rowIndex === PLAN_SUMMARY_ROW_INDEX;
}

export function themeRowIndexFromPlanRow(planRowIndex: number): number {
  return planRowIndex - 1;
}

/** 年ペイン表示用：サマリー行の「年」列のみ（最大2行） */
export function collectYearColumnSummary(
  plan: MidLongTermPlan,
  year: number,
): string {
  const colIndex = year - plan.startYear;
  if (colIndex < 0 || colIndex >= PLAN_YEAR_COLUMN_COUNT) return "";

  const summaryRow = plan.rows[PLAN_SUMMARY_ROW_INDEX];
  if (!summaryRow) return "";

  const cell = summaryRow.years[colIndex];
  if (!cell) return "";

  const parts: string[] = [];
  for (const line of cell.slice(0, 2)) {
    const t = line.trim();
    if (t) parts.push(t);
  }
  return parts.join(" / ");
}

export function yearPlanSummaryExcerpt(
  plan: MidLongTermPlan,
  year: number,
  max = 36,
): string {
  return excerptComment(collectYearColumnSummary(plan, year), max);
}

export function withPlanYearRange(
  plan: MidLongTermPlan,
  startYear: number,
): MidLongTermPlan {
  const endYear = startYear + PLAN_YEAR_COLUMN_COUNT - 1;
  return { ...plan, startYear, endYear };
}

function normalizeCell(raw: unknown): PlanCell {
  if (!Array.isArray(raw)) return createEmptyCell();
  const lines = raw.slice(0, PLAN_SUB_ROW_COUNT).map((v) =>
    typeof v === "string" ? v : "",
  );
  while (lines.length < PLAN_SUB_ROW_COUNT) lines.push("");
  return lines as PlanCell;
}

function normalizeRow(raw: unknown): MidLongTermPlanRow {
  if (!raw || typeof raw !== "object") return createEmptyRow();
  const r = raw as Partial<MidLongTermPlanRow>;
  let years = Array.isArray(r.years)
    ? r.years.map((y) => normalizeCell(y))
    : [];
  while (years.length < PLAN_YEAR_COLUMN_COUNT) {
    years.push(createEmptyCell());
  }
  years = years.slice(0, PLAN_YEAR_COLUMN_COUNT);
  return {
    theme: normalizeCell(r.theme),
    successPoint: normalizeCell(r.successPoint),
    years,
    outcome: normalizeCell(r.outcome),
  };
}

function normalizeThemeRowLabels(
  raw: unknown,
): MidLongTermPlan["themeRowLabels"] {
  const defaults = defaultThemeRowLabels();
  if (!Array.isArray(raw)) return defaults;
  const labels = raw.slice(0, PLAN_THEME_ROW_COUNT).map((v, i) => {
    const s = typeof v === "string" ? v.trim() : "";
    return s || defaults[i];
  });
  while (labels.length < PLAN_THEME_ROW_COUNT) {
    labels.push(defaults[labels.length]);
  }
  return labels as MidLongTermPlan["themeRowLabels"];
}

function legacyYearColumnText(
  themeRows: MidLongTermPlanRow[],
  colIndex: number,
): string {
  const parts: string[] = [];
  for (const row of themeRows) {
    const cell = row.years[colIndex];
    if (!cell) continue;
    for (const line of cell) {
      const t = line.trim();
      if (t) parts.push(t);
    }
  }
  return parts.join(" / ");
}

/** 旧仕様（全テーマ行の年列）→ サマリー行の①②へ移す */
function buildSummaryRowFromLegacy(
  themeRows: MidLongTermPlanRow[],
): MidLongTermPlanRow {
  const summary = createEmptyRow();
  const years = summary.years.map((cell, colIndex) => {
    const merged = legacyYearColumnText(themeRows, colIndex);
    if (!merged) return cell;
    const chunks = merged.split(" / ");
    const next = [...cell] as PlanCell;
    next[0] = chunks[0] ?? "";
    next[1] = chunks.slice(1).join(" / ");
    return next;
  });
  return { ...summary, years };
}

/** 旧データ（7行のみ）→ 先頭にサマリー行を追加 */
function migrateRows(raw: unknown): MidLongTermPlanRow[] {
  if (!Array.isArray(raw)) {
    return Array.from({ length: PLAN_ROW_COUNT }, () => createEmptyRow());
  }
  const normalized = raw.map(normalizeRow);
  if (normalized.length === PLAN_THEME_ROW_COUNT) {
    return [buildSummaryRowFromLegacy(normalized), ...normalized];
  }
  if (normalized.length >= PLAN_ROW_COUNT) {
    return normalized.slice(0, PLAN_ROW_COUNT);
  }
  while (normalized.length < PLAN_ROW_COUNT) {
    normalized.push(createEmptyRow());
  }
  return normalized;
}

export function normalizeMidLongTermPlan(
  input: unknown,
): MidLongTermPlan | undefined {
  if (!input || typeof input !== "object") return undefined;
  const p = input as Partial<MidLongTermPlan>;
  const startYear =
    typeof p.startYear === "number" ? p.startYear : YEAR_PANE_MIN;
  const base = createDefaultPlan(startYear);
  const goals = Array.isArray(p.goals)
    ? p.goals.slice(0, 6).map((g) => (typeof g === "string" ? g : ""))
    : [];
  while (goals.length < 6) goals.push("");
  return {
    startYear,
    endYear:
      typeof p.endYear === "number"
        ? p.endYear
        : startYear + PLAN_YEAR_COLUMN_COUNT - 1,
    createdAt:
      typeof p.createdAt === "string" ? p.createdAt : base.createdAt,
    priorityGoal: typeof p.priorityGoal === "string" ? p.priorityGoal : "",
    goals: goals as MidLongTermPlan["goals"],
    themeRowLabels: normalizeThemeRowLabels(p.themeRowLabels),
    rows: migrateRows(p.rows),
  };
}

export const MLTP_LABELS = {
  modalTitle: "MID/LONG-TERM ACTION PLAN",
  modalSubtitle: "\u4e2d\u9577\u671f\u884c\u52d5\u8a08\u753b\u8868",
  yearRange: "\u5e74",
  yearRangeSep: "\uff5e",
  monthUnit: "\u6708",
  dayUnit: "\u65e5",
  createdSuffix: "\u4f5c\u6210",
  priorityGoal: "\u4e2d\u9577\u671f\u306e\u6700\u91cd\u70b9\u76ee\u6a19",
  priorityGoalPlaceholder:
    "\u5168\u671f\u9593\u3067\u6700\u3082\u91cd\u8981\u306a\u76ee\u6a19\u3092\u8a18\u5165",
  goals: "\u4e2d\u9577\u671f\u306e\u76ee\u6a19",
  goalsHint:
    "\u4e0a\u306e\u6700\u91cd\u70b9\u76ee\u6a19\u3092\u5206\u89e3\u3057\u305f\u5177\u4f53\u76ee\u6a19\uff081\u301c6\uff09",
  boxesRelationHint:
    "\u2193 \u8868\u3067\u30c6\u30fc\u30de\u00d7\u5e74\u306e\u5b9f\u884c\u8a08\u753b\u3092\u7d44\u307f\u7acb\u3066\u307e\u3059",
  colRow: "\u884c",
  colTheme: "\u30c6\u30fc\u30de",
  colSuccess: "\u6210\u5426\u306e\u30dd\u30a4\u30f3\u30c8",
  colOutcome:
    "\u9054\u6210\u306b\u3088\u308b\u6210\u679c\u306e\u30a4\u30e1\u30fc\u30b8",
  colThemeHint: "\u4f8b\uff1a\u4ed5\u4e8b\u30fb\u5065\u5eb7\u30fb\u8cc7\u7523",
  colSuccessHint:
    "\u6210\u529f/\u5931\u6557\u306e\u5224\u65ad\u306b\u306a\u308b\u57fa\u6e96",
  colYearHint: "\u305d\u306e\u5e74\u306e\u30c6\u30fc\u30de\u5225\u306e\u884c\u52d5",
  colYearSummaryHint:
    "\u203b\u30b5\u30de\u30ea\u30fc\u884c\u306e\u5e74\u5217\u2192\u5e74\u30da\u30a4\u30f3\u306b\u8868\u793a",
  colOutcomeHint: "\u9054\u6210\u3057\u305f\u3068\u304d\u306e\u72b6\u614b\u30fb\u6c17\u6301\u3061",
  summaryRowLabel: "\u5e74\u9593\u30b5\u30de\u30ea\u30fc",
  summaryRowBadge: "\u5e74\u30da\u30a4\u30f3\u8868\u793a",
  save: "\u4fdd\u5b58",
  close: "\u9589\u3058\u308b",
  openTitleHint:
    "\u30af\u30ea\u30c3\u30af\u3067\u4e2d\u9577\u671f\u884c\u52d5\u8a08\u753b\u8868\u3092\u958b\u304f",
} as const;

type LineSpec = { tag: string; placeholder: string };

function lineSpecs(
  tags: [string, string, string, string],
  placeholders: [string, string, string, string],
): LineSpec[] {
  return tags.map((tag, i) => ({ tag, placeholder: placeholders[i] }));
}

export function cellLineSpecs(
  column: CellColumnKind,
  isSummaryRow: boolean,
): LineSpec[] {
  if (column === "theme") {
    return lineSpecs(
      ["\u2460", "\u2461", "\u2462", "\u2463"],
      [
        "\u30c6\u30fc\u30de\u540d",
        "\u88dc\u8db3\u30e1\u30e2",
        "",
        "",
      ],
    );
  }
  if (column === "success") {
    return lineSpecs(
      ["\u2460", "\u2461", "\u2462", "\u2463"],
      [
        "\u6210\u529f\u306e\u6761\u4ef6",
        "\u5931\u6557\u306e\u30b5\u30a4\u30f3",
        "\u5224\u65ad\u57fa\u6e96",
        "",
      ],
    );
  }
  if (column === "year") {
    if (isSummaryRow) {
      return lineSpecs(
        ["\u2460", "\u2461", "\u2462", "\u2463"],
        [
          "\u5e74\u30da\u30a4\u30f3\u8981\u7d04\uff081\u884c\u76ee\uff09",
          "\u88dc\u8db3\uff082\u884c\u76ee\u307e\u3067\u8868\u793a\uff09",
          "",
          "",
        ],
      );
    }
    return lineSpecs(
      ["\u2460", "\u2461", "\u2462", "\u2463"],
      [
        "\u305d\u306e\u5e74\u306e\u884c\u52d5",
        "\u9032\u6357\u30fb\u30e1\u30e2",
        "\u30ea\u30b9\u30af",
        "",
      ],
    );
  }
  return lineSpecs(
    ["\u2460", "\u2461", "\u2462", "\u2463"],
    [
      "\u9054\u6210\u72b6\u614b",
      "\u5177\u4f53\u7684\u306a\u6c17\u6301\u3061",
      "",
      "",
    ],
  );
}
