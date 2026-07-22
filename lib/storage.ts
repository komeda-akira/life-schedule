import { withDemoDataIfEmpty } from "@/lib/demo-data";
import { applyNorthStarScreenshotDefaults } from "@/lib/north-star-seeds";
import {
  applyGoalSettingDefaults,
  normalizeGoalSetting,
} from "@/lib/goal-setting";
import {
  applyDailyWorksheetDefaults,
  normalizeDailyWorksheets,
} from "@/lib/daily-worksheet";
import {
  applyWeeklyWorksheetDefaults,
  normalizeWeeklyWorksheets,
} from "@/lib/weekly-worksheet";
import {
  applyPrimeTimeSheetDefaults,
  normalizePrimeTimeSheetData,
} from "@/lib/prime-time-sheet";
import {
  applyMonthlyWorksheetDefaults,
  normalizeMonthlyWorksheets,
} from "@/lib/monthly-worksheet";
import {
  applyLifeWishList100Defaults,
  normalizeLifeWishList100,
} from "@/lib/life-wish-list-100";
import {
  applyMy100YearHistoryDefaults,
  normalizeMy100YearHistory,
} from "@/lib/my-100-year-history";
import { applyPurposeVisionDefaults } from "@/lib/purpose-vision";
import {
  applyLifePhilosophyDefaults,
  normalizeLifePhilosophy,
} from "@/lib/life-philosophy";
import { normalizePurposeVision } from "@/lib/purpose-vision";
import { normalizeMidLongTermPlan } from "@/lib/mid-long-term-plan";
import { STORAGE_KEY } from "@/lib/local-storage";
import { normalizeRecurrenceRule } from "@/lib/recurrence";
import {
  createEmptyAppData,
  DATA_VERSION,
  type AppData,
  type CalendarEvent,
} from "@/lib/types";

function withAllDefaults(input: AppData): AppData {
  return withDemoDataIfEmpty(
    applyPrimeTimeSheetDefaults(
      applyWeeklyWorksheetDefaults(
        applyDailyWorksheetDefaults(
          applyMonthlyWorksheetDefaults(
            applyGoalSettingDefaults(
              applyLifeWishList100Defaults(
                applyMy100YearHistoryDefaults(
                  applyLifePhilosophyDefaults(
                    applyPurposeVisionDefaults(
                      applyNorthStarScreenshotDefaults(input),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

/** 新規利用者向け（個人のサンプル文・デモ予定なし） */
export function bootstrapFreshAppData(): AppData {
  return normalizeAppData({});
}

function stableAppDataFingerprint(data: AppData): string {
  const normalized = normalizeAppData(data);
  const stripped = {
    ...normalized,
    events: normalized.events.map(({ createdAt: _c, ...event }) => event),
    northStar: normalized.northStar.map(({ createdAt: _c, ...item }) => item),
  };
  return JSON.stringify(stripped);
}

/** 開発デモの初回保存データか（実利用者の平文データと区別） */
export function isBootstrapDemoData(data: AppData): boolean {
  return (
    stableAppDataFingerprint(data) ===
    stableAppDataFingerprint(bootstrapAppData())
  );
}

/** 初回表示用・開発デモ（作者のサンプル文付き） */
export function bootstrapAppData(): AppData {
  return withAllDefaults(createEmptyAppData());
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") return createEmptyAppData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return bootstrapAppData();
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return withAllDefaults(normalizeAppData(parsed));
  } catch {
    return bootstrapAppData();
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function normalizeAppData(input: Partial<AppData>): AppData {
  const base = createEmptyAppData();
  return {
    version: DATA_VERSION,
    events: Array.isArray(input.events)
      ? input.events
          .map(normalizeEvent)
          .filter((e): e is CalendarEvent => e !== null)
      : base.events,
    northStar: Array.isArray(input.northStar) ? input.northStar : base.northStar,
    scopeComments:
      input.scopeComments && typeof input.scopeComments === "object"
        ? { ...input.scopeComments }
        : base.scopeComments,
    midLongTermPlan: normalizeMidLongTermPlan(input.midLongTermPlan),
    lifePhilosophy: normalizeLifePhilosophy(input.lifePhilosophy),
    purposeVision: normalizePurposeVision(input.purposeVision),
    my100YearHistory: normalizeMy100YearHistory(input.my100YearHistory),
    lifeWishList100: normalizeLifeWishList100(input.lifeWishList100),
    goalSetting: normalizeGoalSetting(input.goalSetting),
    monthlyWorksheets: normalizeMonthlyWorksheets(input.monthlyWorksheets),
    dailyWorksheets: normalizeDailyWorksheets(input.dailyWorksheets),
    weeklyWorksheets: normalizeWeeklyWorksheets(input.weeklyWorksheets),
    primeTimeSheet: normalizePrimeTimeSheetData(input.primeTimeSheet),
  };
}

function normalizeEvent(raw: unknown): CalendarEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const x = raw as Partial<CalendarEvent>;
  if (
    typeof x.id !== "string" ||
    typeof x.title !== "string" ||
    typeof x.date !== "string" ||
    (x.kind !== "timed" && x.kind !== "allDay") ||
    typeof x.createdAt !== "string"
  ) {
    return null;
  }
  const recurrence = normalizeRecurrenceRule(x.recurrence);
  let endDate =
    typeof x.endDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(x.endDate) &&
    x.endDate > x.date
      ? x.endDate
      : undefined;
  // 時刻付き繰り返しの endDate は複数日連続と誤認されるため破棄する
  if (recurrence && x.kind === "timed") {
    endDate = undefined;
  }
  const recurrenceSkipDates = Array.isArray(x.recurrenceSkipDates)
    ? x.recurrenceSkipDates.filter(
        (d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d),
      )
    : undefined;
  return {
    id: x.id,
    title: x.title,
    memo: typeof x.memo === "string" ? x.memo : undefined,
    date: x.date,
    endDate,
    kind: x.kind,
    startMin: typeof x.startMin === "number" ? x.startMin : undefined,
    endMin: typeof x.endMin === "number" ? x.endMin : undefined,
    createdAt: x.createdAt,
    recurrence,
    recurrenceSkipDates:
      recurrenceSkipDates && recurrenceSkipDates.length > 0
        ? recurrenceSkipDates
        : undefined,
    recurrenceId:
      typeof x.recurrenceId === "string" ? x.recurrenceId : undefined,
  };
}

function isValidEvent(e: unknown): e is CalendarEvent {
  return normalizeEvent(e) !== null;
}

/** インポート: ID 一致は更新、無ければ追加 */
export function mergeImportEvents(
  existing: CalendarEvent[],
  incoming: CalendarEvent[],
): CalendarEvent[] {
  const byId = new Map(existing.map((e) => [e.id, e]));
  for (const ev of incoming) {
    if (!ev.id) continue;
    byId.set(ev.id, ev);
  }
  return [...byId.values()];
}

export function downloadJson(data: AppData, filename?: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ??
    `life-schedule-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
