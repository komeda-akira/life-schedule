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
import { normalizeLifePhilosophy } from "@/lib/life-philosophy";
import { normalizePurposeVision } from "@/lib/purpose-vision";
import { normalizeMidLongTermPlan } from "@/lib/mid-long-term-plan";
import {
  createEmptyAppData,
  DATA_VERSION,
  type AppData,
  type CalendarEvent,
} from "@/lib/types";

const STORAGE_KEY = "life-schedule:v1";

export function loadAppData(): AppData {
  if (typeof window === "undefined") return createEmptyAppData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return withDemoDataIfEmpty(
        applyWeeklyWorksheetDefaults(
          applyDailyWorksheetDefaults(
            applyMonthlyWorksheetDefaults(
              applyGoalSettingDefaults(
                applyLifeWishList100Defaults(
                  applyMy100YearHistoryDefaults(
                    applyPurposeVisionDefaults(
                      applyNorthStarScreenshotDefaults(createEmptyAppData()),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return withDemoDataIfEmpty(
      applyWeeklyWorksheetDefaults(
        applyDailyWorksheetDefaults(
          applyMonthlyWorksheetDefaults(
            applyGoalSettingDefaults(
              applyLifeWishList100Defaults(
                applyMy100YearHistoryDefaults(
                  applyPurposeVisionDefaults(
                    applyNorthStarScreenshotDefaults(normalizeAppData(parsed)),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  } catch {
    return withDemoDataIfEmpty(
      applyWeeklyWorksheetDefaults(
        applyDailyWorksheetDefaults(
          applyMonthlyWorksheetDefaults(
            applyGoalSettingDefaults(
              applyLifeWishList100Defaults(
                applyMy100YearHistoryDefaults(
                  applyPurposeVisionDefaults(
                    applyNorthStarScreenshotDefaults(createEmptyAppData()),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function normalizeAppData(input: Partial<AppData>): AppData {
  const base = createEmptyAppData();
  return {
    version: DATA_VERSION,
    events: Array.isArray(input.events)
      ? input.events.filter(isValidEvent)
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
  };
}

function isValidEvent(e: unknown): e is CalendarEvent {
  if (!e || typeof e !== "object") return false;
  const x = e as CalendarEvent;
  return (
    typeof x.id === "string" &&
    typeof x.title === "string" &&
    typeof x.date === "string" &&
    (x.kind === "timed" || x.kind === "allDay") &&
    typeof x.createdAt === "string"
  );
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
