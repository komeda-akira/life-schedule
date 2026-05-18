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
  purpose: "目的",
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
};

export function createEmptyAppData(): AppData {
  return {
    version: DATA_VERSION,
    events: [],
    northStar: [],
    scopeComments: {},
  };
}
