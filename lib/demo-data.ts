import type { AppData, CalendarEvent } from "@/lib/types";

const DEMO_DATE = "2026-05-21";
const now = () => new Date().toISOString();

/** 参照ワイヤー相当のサンプル予定（2026-05-21） */
export function createDemoEvents(): CalendarEvent[] {
  const base = { date: DEMO_DATE, kind: "timed" as const, createdAt: now() };
  return [
    { id: "demo-1", title: "朝食", ...base, startMin: 7 * 60 + 30, endMin: 8 * 60 + 30 },
    { id: "demo-2", title: "チームミーティング", ...base, startMin: 9 * 60, endMin: 11 * 60 },
    { id: "demo-3", title: "設計レビュー", ...base, startMin: 11 * 60, endMin: 12 * 60 + 30 },
    { id: "demo-4", title: "顧客打合せ", ...base, startMin: 13 * 60 + 30, endMin: 14 * 60 + 30 },
    { id: "demo-5", title: "資料作成", ...base, startMin: 15 * 60, endMin: 16 * 60 },
    { id: "demo-6", title: "進捗確認", ...base, startMin: 17 * 60, endMin: 18 * 60 },
    { id: "demo-7", title: "夕食", ...base, startMin: 20 * 60, endMin: 21 * 60 + 30 },
  ];
}

export function withDemoDataIfEmpty(data: AppData): AppData {
  if (data.events.length > 0) return data;
  return {
    ...data,
    events: createDemoEvents(),
    scopeComments: {
      ...data.scopeComments,
      "year:2026":
        "この年のスコープや方針、注力テーマなどを記入してください。",
    },
  };
}
