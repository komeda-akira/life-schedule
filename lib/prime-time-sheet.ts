import type { AppData } from "@/lib/types";

export const PRIME_ACTION_ITEM_COUNT = 6;

/** 1ページ分のシート内容 */
export type PrimeTimeSheetContent = {
  createdYear: string;
  createdMonth: string;
  createdDay: string;
  achieveGoal: string;
  indicatorWhat: string;
  indicatorByWhen: string;
  currentState: string;
  gap: string;
  actionItems: string[];
  quadrant1: string;
  quadrant2: string;
  quadrant3: string;
  quadrant4: string;
};

export type PrimeTimeSheetPage = {
  id: string;
  title: string;
} & PrimeTimeSheetContent;

export type PrimeTimeSheetData = {
  activePageId: string;
  pages: PrimeTimeSheetPage[];
};

/** @deprecated use PrimeTimeSheetContent */
export type PrimeTimeSheet = PrimeTimeSheetContent;

export const DEFAULT_PRIME_TIME_SHEET_CONTENT: PrimeTimeSheetContent = {
  createdYear: "",
  createdMonth: "",
  createdDay: "",
  achieveGoal: "修了考査(RP)に合格する。まずは及第してCPAになる。",
  indicatorWhat: "すべての判定をB評価にする。",
  indicatorByWhen: "R8年11月末までに!!",
  currentState: "1日0時間",
  gap: "毎日安定的に1H勉強する!!",
  actionItems: [
    "まず答練",
    "テキスト",
    "暗記",
    "定時に退社して時間つくる",
    "",
    "",
  ],
  quadrant1:
    "一度テキストをやり直す\n答練を問き直す\n定時に退社する\n1日1Hの勉強時間をどうやって確保するかプランニングを立てる",
  quadrant2: "",
  quadrant3: "",
  quadrant4: "",
};

function mergeStr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeActionItems(input: unknown, base: string[]): string[] {
  if (!Array.isArray(input)) return [...base];
  return Array.from({ length: PRIME_ACTION_ITEM_COUNT }, (_, i) =>
    mergeStr(input[i], base[i] ?? ""),
  );
}

export function createEmptyPrimeTimeSheetContent(): PrimeTimeSheetContent {
  return {
    createdYear: "",
    createdMonth: "",
    createdDay: "",
    achieveGoal: "",
    indicatorWhat: "",
    indicatorByWhen: "",
    currentState: "",
    gap: "",
    actionItems: Array.from({ length: PRIME_ACTION_ITEM_COUNT }, () => ""),
    quadrant1: "",
    quadrant2: "",
    quadrant3: "",
    quadrant4: "",
  };
}

export function normalizePrimeTimeSheetContent(
  input?: Partial<PrimeTimeSheetContent> | null,
  useDemoDefaults = false,
): PrimeTimeSheetContent {
  const base = useDemoDefaults
    ? DEFAULT_PRIME_TIME_SHEET_CONTENT
    : createEmptyPrimeTimeSheetContent();
  if (!input) {
    return {
      ...base,
      actionItems: [...base.actionItems],
    };
  }

  return {
    createdYear: mergeStr(input.createdYear, base.createdYear),
    createdMonth: mergeStr(input.createdMonth, base.createdMonth),
    createdDay: mergeStr(input.createdDay, base.createdDay),
    achieveGoal: mergeStr(input.achieveGoal, base.achieveGoal),
    indicatorWhat: mergeStr(input.indicatorWhat, base.indicatorWhat),
    indicatorByWhen: mergeStr(input.indicatorByWhen, base.indicatorByWhen),
    currentState: mergeStr(input.currentState, base.currentState),
    gap: mergeStr(input.gap, base.gap),
    actionItems: normalizeActionItems(input.actionItems, base.actionItems),
    quadrant1: mergeStr(input.quadrant1, base.quadrant1),
    quadrant2: mergeStr(input.quadrant2, base.quadrant2),
    quadrant3: mergeStr(input.quadrant3, base.quadrant3),
    quadrant4: mergeStr(input.quadrant4, base.quadrant4),
  };
}

/** @deprecated use normalizePrimeTimeSheetContent */
export function normalizePrimeTimeSheet(
  input?: Partial<PrimeTimeSheetContent> | null,
): PrimeTimeSheetContent {
  return normalizePrimeTimeSheetContent(input, !input);
}

export function suggestPageTitle(
  content: PrimeTimeSheetContent,
  fallbackIndex: number,
): string {
  const goal = content.achieveGoal.trim();
  if (goal) {
    const line = goal.split("\n")[0]?.trim() ?? goal;
    return line.length > 24 ? `${line.slice(0, 24)}…` : line;
  }
  const what = content.indicatorWhat.trim();
  if (what) {
    return what.length > 24 ? `${what.slice(0, 24)}…` : what;
  }
  return `ページ ${fallbackIndex}`;
}

export function normalizePrimeTimeSheetPage(
  input: unknown,
  index: number,
  useDemoDefaults = false,
): PrimeTimeSheetPage | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" && row.id.trim() ? row.id : `page-${index}`;
  const content = normalizePrimeTimeSheetContent(
    row as Partial<PrimeTimeSheetContent>,
    useDemoDefaults,
  );
  const title =
    typeof row.title === "string" && row.title.trim()
      ? row.title.trim()
      : suggestPageTitle(content, index + 1);
  return { id, title, ...content };
}

function isLegacySingleSheet(input: Record<string, unknown>): boolean {
  return (
    !Array.isArray(input.pages) &&
    ("achieveGoal" in input ||
      "indicatorWhat" in input ||
      "quadrant1" in input)
  );
}

export function createDefaultPrimeTimeSheetData(): PrimeTimeSheetData {
  const id = "page-default-1";
  const content = normalizePrimeTimeSheetContent(null, true);
  return {
    activePageId: id,
    pages: [
      {
        id,
        title: suggestPageTitle(content, 1),
        ...content,
      },
    ],
  };
}

export function normalizePrimeTimeSheetData(input: unknown): PrimeTimeSheetData {
  if (!input || typeof input !== "object") {
    return createDefaultPrimeTimeSheetData();
  }

  const raw = input as Record<string, unknown>;

  if (isLegacySingleSheet(raw)) {
    const content = normalizePrimeTimeSheetContent(
      raw as Partial<PrimeTimeSheetContent>,
      true,
    );
    const id = "page-migrated-1";
    return {
      activePageId: id,
      pages: [{ id, title: suggestPageTitle(content, 1), ...content }],
    };
  }

  if (!Array.isArray(raw.pages) || raw.pages.length === 0) {
    return createDefaultPrimeTimeSheetData();
  }

  const pages: PrimeTimeSheetPage[] = [];
  raw.pages.forEach((item, i) => {
    const page = normalizePrimeTimeSheetPage(item, i + 1, false);
    if (page) pages.push(page);
  });

  if (pages.length === 0) return createDefaultPrimeTimeSheetData();

  const activePageId =
    typeof raw.activePageId === "string" &&
    pages.some((p) => p.id === raw.activePageId)
      ? raw.activePageId
      : pages[0].id;

  return { activePageId, pages };
}

export function getActivePrimeTimeSheetPage(
  data: PrimeTimeSheetData,
): PrimeTimeSheetPage {
  return (
    data.pages.find((p) => p.id === data.activePageId) ?? data.pages[0]
  );
}

export function displayPageTitle(
  page: PrimeTimeSheetContent & { title?: string },
  index: number,
): string {
  const trimmed = page.title?.trim() ?? "";
  if (trimmed) return trimmed;
  return suggestPageTitle(page, index);
}

export function primeTimeSheetExcerpt(
  sheet: PrimeTimeSheetContent | PrimeTimeSheetPage,
): string {
  const goal = sheet.achieveGoal.trim();
  if (goal) return goal.split("\n")[0] ?? goal;
  const what = sheet.indicatorWhat.trim();
  if (what) return what;
  return "";
}

export function primeTimeSheetDataExcerpt(data: PrimeTimeSheetData): string {
  const active = getActivePrimeTimeSheetPage(data);
  const index = Math.max(
    0,
    data.pages.findIndex((p) => p.id === active.id),
  );
  const title = displayPageTitle(active, index + 1);
  if (title && !/^ページ \d+$/.test(title)) return title;
  const fromContent = primeTimeSheetExcerpt(active);
  if (fromContent) return fromContent;
  if (data.pages.length > 1) {
    return `${displayPageTitle(active, index + 1)} ほか${data.pages.length - 1}件`;
  }
  return displayPageTitle(active, index + 1);
}

export function applyPrimeTimeSheetDefaults(data: AppData): AppData {
  return {
    ...data,
    primeTimeSheet: normalizePrimeTimeSheetData(data.primeTimeSheet),
  };
}
