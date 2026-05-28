import type { LifePhilosophy } from "@/lib/life-philosophy";
import type { GoalSetting } from "@/lib/goal-setting";
import type { LifeWishList100 } from "@/lib/life-wish-list-100";
import type { My100YearHistory } from "@/lib/my-100-year-history";
import type { PurposeVision } from "@/lib/purpose-vision";
import type { MidLongTermPlan } from "@/lib/mid-long-term-plan";

export const DATA_VERSION = 1 as const;

export type EventKind = "timed" | "allDay";

export type CalendarEvent = {
  id: string;
  title: string;
  memo?: string;
  /** YYYY-MM-DD（ローカル日） */
  date: string;
  kind: EventKind;
  startMin?: number;
  endMin?: number;
  createdAt: string;
};

export type NorthStarCategory = "vision" | "purpose" | "goal" | "prime";

export const NORTH_STAR_LABELS: Record<NorthStarCategory, string> = {
  vision: "理念",
  purpose: "\u76ee\u7684\u30fb\u30d3\u30b8\u30e7\u30f3",
  goal: "目標",
  prime: "プライムシート",
};

export type NorthStarItem = {
  id: string;
  category: NorthStarCategory;
  title: string;
  memo?: string;
  createdAt: string;
};

export type AppData = {
  version: typeof DATA_VERSION;
  events: CalendarEvent[];
  northStar: NorthStarItem[];
  /** 例: year:2026 / month:2026-03 / week:2026-W11 */
  scopeComments: Record<string, string>;
  midLongTermPlan?: MidLongTermPlan;
  lifePhilosophy?: LifePhilosophy;
  purposeVision?: PurposeVision;
  my100YearHistory?: My100YearHistory;
  lifeWishList100?: LifeWishList100;
  goalSetting?: GoalSetting;
};

export function createEmptyAppData(): AppData {
  return {
    version: DATA_VERSION,
    events: [],
    northStar: [],
    scopeComments: {},
  };
}
