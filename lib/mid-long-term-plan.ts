import { excerptComment, YEAR_PANE_MIN } from "@/lib/calendar";

/** 0 = 年間サマリー行、1〜7 = テーマ行 */
export const PLAN_SUMMARY_ROW_INDEX = 0;
export const PLAN_THEME_ROW_COUNT = 7;
export const PLAN_ROW_COUNT = PLAN_THEME_ROW_COUNT + 1;
export const PLAN_SUB_ROW_COUNT = 4;
export const PLAN_YEAR_COLUMN_COUNT = 10;

/** 年齢表・テーマ表で年列の位置を揃える列幅（table-fixed 合計 100%） */
export const MLTP_COL_LEAD = "w-[7%]";
export const MLTP_COL_SECOND = "w-[10.5%]";
export const MLTP_COL_YEAR = "w-[8.25%]";

/** 表の年列のデフォルト開始年（2026年〜2035年の10年分） */
export const MLTP_PLAN_DEFAULT_START_YEAR = 2026;

/** @deprecated 後方互換。新規は MLTP_PLAN_DEFAULT_START_YEAR を使用 */
export const MLTP_PLAN_END_YEAR =
  MLTP_PLAN_DEFAULT_START_YEAR + PLAN_YEAR_COLUMN_COUNT - 1;

export function defaultPlanStartYear(): number {
  return MLTP_PLAN_DEFAULT_START_YEAR;
}

export const PLAN_FAMILY_MEMBER_MIN = 1;
export const PLAN_FAMILY_MEMBER_MAX = 8;
export const DEFAULT_FAMILY_MEMBER_COUNT = 2;

export type PlanCell = [string, string, string, string];

export type PlanFamilyMember = {
  name: string;
  /** 基準年時点の満年齢（入力用） */
  currentAge: number | null;
  /** 生年（currentAge から自動、または legacy データ） */
  birthYear: number | null;
};

export type PlanFamilyMembers = PlanFamilyMember[];

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
  /** 家族（表上部で入力 → 年齢表の行数と連動） */
  familyMembers: PlanFamilyMembers;
  rows: MidLongTermPlanRow[];
};

export type CellColumnKind = "theme" | "success" | "year" | "outcome";

export function createEmptyCell(): PlanCell {
  return ["", "", "", ""];
}

/** 年列セルを1つの自由記入テキストとして読み書きする */
export function planYearCellToText(cell: PlanCell): string {
  if (!cell.slice(1).some((line) => line.trim())) {
    return cell[0] ?? "";
  }
  return cell
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function textToPlanYearCell(text: string): PlanCell {
  return [text, "", "", ""];
}

export function createEmptyFamilyMember(): PlanFamilyMember {
  return { name: "", currentAge: null, birthYear: null };
}

export function createEmptyFamilyMembers(
  count = DEFAULT_FAMILY_MEMBER_COUNT,
): PlanFamilyMembers {
  return Array.from({ length: count }, () => createEmptyFamilyMember());
}

export function clampFamilyMemberCount(count: number): number {
  return Math.min(
    PLAN_FAMILY_MEMBER_MAX,
    Math.max(PLAN_FAMILY_MEMBER_MIN, Math.round(count)),
  );
}

export function clampFamilyMembers(
  members: PlanFamilyMember[],
): PlanFamilyMembers {
  const trimmed = members.slice(0, PLAN_FAMILY_MEMBER_MAX);
  while (trimmed.length < PLAN_FAMILY_MEMBER_MIN) {
    trimmed.push(createEmptyFamilyMember());
  }
  return trimmed;
}

export function resizeFamilyMembers(
  members: PlanFamilyMembers,
  count: number,
): PlanFamilyMembers {
  const next = clampFamilyMembers(members.slice(0, clampFamilyMemberCount(count)));
  while (next.length < clampFamilyMemberCount(count)) {
    next.push(createEmptyFamilyMember());
  }
  return next;
}

export function planReferenceYear(plan: MidLongTermPlan): number {
  const d = new Date(plan.createdAt);
  if (Number.isNaN(d.getTime())) return new Date().getFullYear();
  return d.getFullYear();
}

/** 基準年と currentAge / birthYear から生年を決める */
export function resolveBirthYear(
  member: PlanFamilyMember,
  referenceYear: number,
): number | null {
  if (member.birthYear != null && member.birthYear >= 1900 && member.birthYear <= 2100) {
    return member.birthYear;
  }
  if (member.currentAge != null && member.currentAge >= 0 && member.currentAge <= 150) {
    return referenceYear - member.currentAge;
  }
  return null;
}

export function currentAgeFromBirthYear(
  birthYear: number,
  referenceYear: number,
): number {
  return referenceYear - birthYear;
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

/** 文字列から西暦（生年）を取り出す */
export function parseBirthYear(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const onlyYear = /^(\d{4})$/.exec(t);
  if (onlyYear) {
    const y = Number(onlyYear[1]);
    if (y >= 1900 && y <= 2100) return y;
  }
  const embedded = /(19\d{2}|20\d{2})/.exec(t);
  if (embedded) return Number(embedded[1]);
  return null;
}

export function formatAgeInCalendarYear(
  birthYear: number,
  calendarYear: number,
): string {
  const age = calendarYear - birthYear;
  if (age < 0) return "\u672a\u51fa\u751f";
  return `${age}\u6b73`;
}

type SlotIdentity = { name: string; birthYear: number | null };

/** ①家族の名前・②年齢（生年）列から名前と生年を解釈（年齢列に名前だけ書いた場合も可） */
export function resolveSlotIdentity(
  row: MidLongTermPlanRow,
  slot: number,
): SlotIdentity {
  const themeText = row.theme[slot]?.trim() ?? "";
  const ageColText = row.successPoint[slot]?.trim() ?? "";
  const birthInAgeCol = parseBirthYear(ageColText);
  const birthInThemeCol = parseBirthYear(themeText);
  const ageColIsBirthYear =
    birthInAgeCol != null && /^\d{4}$/.test(ageColText);
  const themeColIsBirthYear =
    birthInThemeCol != null && /^\d{4}$/.test(themeText);

  let name = "";
  let birthYear: number | null = null;

  if (themeText && !themeColIsBirthYear) name = themeText;
  if (ageColText && !ageColIsBirthYear) {
    if (!name) name = ageColText;
  }
  if (ageColIsBirthYear) birthYear = birthInAgeCol;
  else if (themeColIsBirthYear) birthYear = birthInThemeCol;

  return { name, birthYear };
}

/** サマリー行の年列に familyMembers から満年齢を入れる（年ペイン表示用） */
export function fillAgesForRow(
  row: MidLongTermPlanRow,
  startYear: number,
  endYear: number,
  familyMembers?: PlanFamilyMembers,
  referenceYear?: number,
  summaryRow = false,
): MidLongTermPlanRow {
  const memberCount = familyMembers?.length ?? 0;
  const years = row.years.map((cell, colIndex) => {
    const calendarYear = startYear + colIndex;
    if (calendarYear > endYear) return cell;
    const next = textToPlanYearCell("");

    if (summaryRow && familyMembers && referenceYear != null) {
      const parts: string[] = [];
      for (let slot = 0; slot < memberCount; slot++) {
        const member = familyMembers[slot];
        if (!member?.name.trim()) continue;
        const birthYear = resolveBirthYear(member, referenceYear);
        if (birthYear == null) continue;
        parts.push(formatAgeInCalendarYear(birthYear, calendarYear));
      }
      next[0] = parts.join("\n");
      return next;
    }

    if (summaryRow) {
      for (let slot = 0; slot < PLAN_SUB_ROW_COUNT; slot++) {
        const { name, birthYear } = resolveSlotIdentity(row, slot);
        if (!name || birthYear == null) continue;
        const age = formatAgeInCalendarYear(birthYear, calendarYear);
        if (next[0]) next[0] += `\n${age}`;
        else next[0] = age;
      }
    }

    return next;
  });
  return { ...row, years };
}

/** テーマ行の年列①に残った自動年齢表記を除去 */
function clearStaleAgesFromThemeRows(
  plan: MidLongTermPlan,
): MidLongTermPlan {
  const rows = plan.rows.map((row, rowIndex) => {
    if (rowIndex === PLAN_SUMMARY_ROW_INDEX) return row;
    const years = row.years.map((cell) => {
      const merged = planYearCellToText(cell);
      const next = textToPlanYearCell(merged);
      const t = next[0]?.trim() ?? "";
      if (/^\d+歳$/.test(t) || t === "未出生") {
        next[0] = "";
      }
      return next;
    });
    return { ...row, years };
  });
  return { ...plan, rows };
}

export function applyFamilyMembersToPlan(
  plan: MidLongTermPlan,
  referenceYear: number,
): MidLongTermPlan {
  const members = clampFamilyMembers(plan.familyMembers ?? createEmptyFamilyMembers());
  const rows = plan.rows.map((row, rowIndex) => {
    if (rowIndex !== PLAN_SUMMARY_ROW_INDEX) return row;
    const theme = [...row.theme] as PlanCell;
    const success = [...row.successPoint] as PlanCell;
    for (let slot = 0; slot < PLAN_SUB_ROW_COUNT; slot++) {
      const member = members[slot];
      theme[slot] = member?.name ?? "";
      const birthYear = member ? resolveBirthYear(member, referenceYear) : null;
      success[slot] = birthYear != null ? String(birthYear) : "";
    }
    return { ...row, theme, successPoint: success };
  });
  return fillAgesForPlan(
    clearStaleAgesFromThemeRows({ ...plan, familyMembers: members, rows }),
    referenceYear,
  );
}

export function fillAgesForPlan(
  plan: MidLongTermPlan,
  referenceYear?: number,
): MidLongTermPlan {
  const ref = referenceYear ?? planReferenceYear(plan);
  const endYear = plan.endYear;
  const members = clampFamilyMembers(plan.familyMembers ?? createEmptyFamilyMembers());
  const rows = plan.rows.map((row, rowIndex) =>
    fillAgesForRow(
      row,
      plan.startYear,
      endYear,
      members,
      ref,
      rowIndex === PLAN_SUMMARY_ROW_INDEX,
    ),
  );
  return { ...plan, familyMembers: members, endYear, rows };
}

export function createDefaultPlan(
  startYear = defaultPlanStartYear(),
): MidLongTermPlan {
  return {
    startYear,
    endYear: startYear + PLAN_YEAR_COLUMN_COUNT - 1,
    createdAt: new Date().toISOString(),
    priorityGoal: "",
    goals: ["", "", "", "", "", ""],
    themeRowLabels: defaultThemeRowLabels(),
    familyMembers: createEmptyFamilyMembers(),
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

/** 年ペイン表示用：家族の年齢サマリー */
export function collectYearColumnSummary(
  plan: MidLongTermPlan,
  year: number,
): string {
  const colIndex = year - plan.startYear;
  if (colIndex < 0 || colIndex >= PLAN_YEAR_COLUMN_COUNT) return "";

  const members = clampFamilyMembers(
    plan.familyMembers ?? createEmptyFamilyMembers(),
  );
  const refYear = planReferenceYear(plan);
  const parts: string[] = [];
  for (const member of members) {
    const name = member.name.trim();
    if (!name) continue;
    const birthYear = resolveBirthYear(member, refYear);
    if (birthYear == null) {
      parts.push(name);
      continue;
    }
    parts.push(`${name} ${formatAgeInCalendarYear(birthYear, year)}`);
  }
  if (parts.length > 0) return parts.join(" / ");

  const summaryRow = plan.rows[PLAN_SUMMARY_ROW_INDEX];
  if (!summaryRow) return "";
  const cell = summaryRow.years[colIndex];
  if (!cell) return "";
  return planYearCellToText(cell).replace(/\n/g, " / ");
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

function normalizeFamilyMember(
  raw: unknown,
  fallback: PlanFamilyMember,
): PlanFamilyMember {
  if (!raw || typeof raw !== "object") return fallback;
  const r = raw as Partial<PlanFamilyMember>;
  const name = typeof r.name === "string" ? r.name : fallback.name;
  const currentAge =
    typeof r.currentAge === "number" && r.currentAge >= 0 && r.currentAge <= 150
      ? Math.round(r.currentAge)
      : fallback.currentAge;
  const birthYear =
    typeof r.birthYear === "number" && r.birthYear >= 1900 && r.birthYear <= 2100
      ? Math.round(r.birthYear)
      : fallback.birthYear;
  return { name, currentAge, birthYear };
}

function normalizeFamilyMembers(
  raw: unknown,
  summaryRow: MidLongTermPlanRow | undefined,
  referenceYear: number,
): PlanFamilyMembers {
  if (Array.isArray(raw) && raw.length > 0) {
    return clampFamilyMembers(
      raw.map((item) =>
        normalizeFamilyMember(item, createEmptyFamilyMember()),
      ),
    );
  }
  if (!summaryRow) return createEmptyFamilyMembers();
  const fromSummary: PlanFamilyMember[] = [];
  for (let slot = 0; slot < PLAN_SUB_ROW_COUNT; slot++) {
    const { name, birthYear } = resolveSlotIdentity(summaryRow, slot);
    if (!name && birthYear == null) continue;
    fromSummary.push({
      name: name || "",
      birthYear,
      currentAge:
        birthYear != null
          ? currentAgeFromBirthYear(birthYear, referenceYear)
          : null,
    });
  }
  if (fromSummary.length > 0) return clampFamilyMembers(fromSummary);
  return createEmptyFamilyMembers();
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
    typeof p.startYear === "number" ? p.startYear : defaultPlanStartYear();
  const base = createDefaultPlan(startYear);
  const goals = Array.isArray(p.goals)
    ? p.goals.slice(0, 6).map((g) => (typeof g === "string" ? g : ""))
    : [];
  while (goals.length < 6) goals.push("");
  const createdAt =
    typeof p.createdAt === "string" ? p.createdAt : base.createdAt;
  const refYear = planReferenceYear({ ...base, createdAt });
  const rows = migrateRows(p.rows);
  const familyMembers = normalizeFamilyMembers(
    p.familyMembers,
    rows[PLAN_SUMMARY_ROW_INDEX],
    refYear,
  );
  return applyFamilyMembersToPlan(
    {
      startYear,
      endYear:
        typeof p.endYear === "number"
          ? p.endYear
          : startYear + PLAN_YEAR_COLUMN_COUNT - 1,
      createdAt,
      priorityGoal: typeof p.priorityGoal === "string" ? p.priorityGoal : "",
      goals: goals as MidLongTermPlan["goals"],
      themeRowLabels: normalizeThemeRowLabels(p.themeRowLabels),
      familyMembers,
      rows,
    },
    refYear,
  );
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
    "↓ 年齢表は家族の人数に連動し、テーマ表では各年の計画を記入します",
  familySectionTitle: "家族の名前と現在の年齢",
  familySectionHint:
    "人数を設定し、名前と現在の満年齢を入力すると、下の年齢表に各年の満年齢が反映されます（基準年＝作成年）",
  familyCountLabel: "家族の人数",
  familyAddMember: "家族を追加",
  familyRemoveMember: "削除",
  familyName: "名前",
  familyCurrentAge: "現在の満年齢",
  familyBirthYearAuto: "生年（自動）",
  familyAgeUnit: "歳",
  familySyncedHint: "↑ 上のセクションで編集した内容が表に反映されます",
  tableSectionFamily: "家族の年齢",
  tableSectionFamilyHint: "上部で設定した人数分の行が表示され、各年の満年齢が自動計算されます",
  tableSectionTheme: "テーマ × 年代ごとの計画",
  tableSectionThemeLead: "各テーマについて、10年間の計画を自由に記入",
  tableSectionThemeHint: "左のテーマ名を編集し、概要と各年列にその年代の具体的な内容を書きます",
  colFamilyName: "家族名",
  colBirthYear: "生年",
  colThemeName: "テーマ名",
  colThemeOverview: "テーマ概要",
  colSuccessPoint: "成功ポイント",
  colRow: "テーマ",
  colTheme: "家族名／概要",
  colSuccess: "生年／成功点",
  colOutcome:
    "達成による成果のイメージ",
  colThemeHintSummary: "家族の名前（上部で入力）",
  colThemeHintTheme: "テーマの概要",
  colSuccessHintSummary: "生年（自動）",
  colSuccessHintTheme: "成功のポイント",
  colYearHintSummary: "満年齢（自動）",
  colYearHintTheme: "自由記入",
  colThemeHint: "サマリー＝家族名／テーマ行＝概要",
  colSuccessHint: "サマリー＝生年／テーマ行＝成功点",
  colYearAgeHint: "サマリー＝満年齢／テーマ行＝年別計画",
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
  tags: readonly string[],
  placeholders: readonly string[],
): LineSpec[] {
  return tags.map((tag, i) => ({
    tag,
    placeholder: placeholders[i] ?? "",
  }));
}

export function cellLineSpecs(
  column: CellColumnKind,
  isSummaryRow: boolean,
): LineSpec[] {
  if (column === "theme") {
    if (isSummaryRow) {
      return lineSpecs(
        ["\u2460", "\u2461", "\u2462", "\u2463"],
        [
          "\u2191 \u4e0a\u90e8\u3067\u5165\u529b",
          "",
          "",
          "",
        ],
      );
    }
    return lineSpecs(
      ["\u2460", "\u2461"],
      ["\u30c6\u30fc\u30de\u6982\u8981", "\u88dc\u8db3"],
    );
  }
  if (column === "success") {
    if (isSummaryRow) {
      return lineSpecs(
        ["\u2460", "\u2461", "\u2462", "\u2463"],
        [
          "\u751f\u5e74\uff08\u81ea\u52d5\uff09",
          "",
          "",
          "",
        ],
      );
    }
    return lineSpecs(
      ["\u2460", "\u2461"],
      ["\u6210\u529f\u306e\u30dd\u30a4\u30f3\u30c8", "\u88dc\u8db3"],
    );
  }
  if (column === "year") {
    if (isSummaryRow) {
      return lineSpecs(
        ["\u2460", "\u2461", "\u2462", "\u2463"],
        [
          "\u6e80\u5e74\u9f62\uff08\u81ea\u52d5\uff09",
          "\u88dc\u8db3\uff082\u884c\u76ee\u307e\u3067\u8868\u793a\uff09",
          "",
          "",
        ],
      );
    }
    return lineSpecs(
      ["\u2460", "\u2461", "\u2462"],
      ["\u305d\u306e\u5e74\u306e\u76ee\u6a19", "\u9032\u6357\u30fb\u30e1\u30e2", "\u30ea\u30b9\u30af"],
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
