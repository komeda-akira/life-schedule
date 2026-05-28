"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createDefaultPlan } from "@/lib/mid-long-term-plan";
import type { MidLongTermPlan } from "@/lib/mid-long-term-plan";
import {
  normalizeLifePhilosophy,
  type LifePhilosophy,
} from "@/lib/life-philosophy";
import {
  normalizeLifeWishList100,
  type LifeWishList100,
} from "@/lib/life-wish-list-100";
import {
  normalizeMy100YearHistory,
  type My100YearHistory,
} from "@/lib/my-100-year-history";
import {
  normalizeGoalSetting,
  type GoalSetting,
} from "@/lib/goal-setting";
import {
  normalizeDailyWorksheet,
  normalizeDailyWorksheets,
  type DailyWorksheet,
} from "@/lib/daily-worksheet";
import {
  normalizeMonthlyWorksheet,
  normalizeMonthlyWorksheets,
  type MonthlyWorksheet,
} from "@/lib/monthly-worksheet";
import {
  normalizeWeeklyWorksheet,
  normalizeWeeklyWorksheets,
  type WeeklyWorksheet,
} from "@/lib/weekly-worksheet";
import {
  createEmptyPrimeTimeSheetContent,
  getActivePrimeTimeSheetPage,
  normalizePrimeTimeSheetContent,
  normalizePrimeTimeSheetData,
  suggestPageTitle,
  type PrimeTimeSheetContent,
  type PrimeTimeSheetData,
  type PrimeTimeSheetPage,
} from "@/lib/prime-time-sheet";
import {
  normalizePurposeVision,
  type PurposeVision,
} from "@/lib/purpose-vision";
import { applyNorthStarScreenshotDefaults } from "@/lib/north-star-seeds";
import {
  loadAppData,
  mergeImportEvents,
  normalizeAppData,
  saveAppData,
} from "@/lib/storage";
import { createEmptyAppData } from "@/lib/types";
import type {
  AppData,
  CalendarEvent,
  NorthStarCategory,
  NorthStarItem,
} from "@/lib/types";

type AppDataContextValue = {
  data: AppData;
  eventsForDate: (dateKey: string) => CalendarEvent[];
  upsertEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  upsertNorthStar: (item: NorthStarItem) => void;
  deleteNorthStar: (id: string) => void;
  northStarFor: (category: NorthStarCategory) => NorthStarItem[];
  getScopeComment: (key: string) => string;
  setScopeComment: (key: string, text: string) => void;
  getMidLongTermPlan: () => MidLongTermPlan;
  setMidLongTermPlan: (plan: MidLongTermPlan) => void;
  getLifePhilosophy: () => LifePhilosophy;
  updateLifePhilosophy: (partial: Partial<LifePhilosophy>) => void;
  getPurposeVision: () => PurposeVision;
  updatePurposeVision: (partial: Partial<PurposeVision>) => void;
  getMy100YearHistory: () => My100YearHistory;
  updateMy100YearHistory: (partial: Partial<My100YearHistory>) => void;
  getLifeWishList100: () => LifeWishList100;
  updateLifeWishList100: (partial: Partial<LifeWishList100>) => void;
  getGoalSetting: () => GoalSetting;
  updateGoalSetting: (partial: Partial<GoalSetting>) => void;
  getMonthlyWorksheet: (
    monthKey: string,
    year: number,
    month: number,
  ) => MonthlyWorksheet;
  updateMonthlyWorksheet: (
    monthKey: string,
    year: number,
    month: number,
    partial: Partial<MonthlyWorksheet>,
  ) => void;
  getDailyWorksheet: (dayKey: string) => DailyWorksheet;
  updateDailyWorksheet: (
    dayKey: string,
    partial: Partial<DailyWorksheet>,
  ) => void;
  getWeeklyWorksheet: (weekKey: string, weekMonday: Date) => WeeklyWorksheet;
  updateWeeklyWorksheet: (
    weekKey: string,
    weekMonday: Date,
    partial: Partial<WeeklyWorksheet>,
  ) => void;
  getPrimeTimeSheetData: () => PrimeTimeSheetData;
  getActivePrimeTimeSheetPage: () => PrimeTimeSheetPage;
  updatePrimeTimeSheetPage: (
    pageId: string,
    partial: Partial<PrimeTimeSheetContent> & { title?: string },
  ) => void;
  addPrimeTimeSheetPage: () => void;
  deletePrimeTimeSheetPage: (pageId: string) => void;
  setActivePrimeTimeSheetPage: (pageId: string) => void;
  importData: (partial: Partial<AppData>) => void;
  exportData: () => AppData;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(createEmptyAppData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(applyNorthStarScreenshotDefaults(loadAppData()));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveAppData(data);
  }, [data, hydrated]);

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const eventsForDate = useCallback(
    (dateKey: string) =>
      data.events.filter((e) => e.date === dateKey).sort(compareEvents),
    [data.events],
  );

  const upsertEvent = useCallback((event: CalendarEvent) => {
    update((prev) => {
      const rest = prev.events.filter((e) => e.id !== event.id);
      return { ...prev, events: [...rest, event] };
    });
  }, [update]);

  const deleteEvent = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== id),
      }));
    },
    [update],
  );

  const upsertNorthStar = useCallback((item: NorthStarItem) => {
    update((prev) => {
      const rest = prev.northStar.filter((n) => n.id !== item.id);
      return { ...prev, northStar: [...rest, item] };
    });
  }, [update]);

  const deleteNorthStar = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        northStar: prev.northStar.filter((n) => n.id !== id),
      }));
    },
    [update],
  );

  const northStarFor = useCallback(
    (category: NorthStarCategory) =>
      data.northStar
        .filter((n) => n.category === category)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [data.northStar],
  );

  const getScopeComment = useCallback(
    (key: string) => data.scopeComments[key] ?? "",
    [data.scopeComments],
  );

  const setScopeComment = useCallback(
    (key: string, text: string) => {
      update((prev) => {
        const scopeComments = { ...prev.scopeComments };
        const trimmed = text.trim();
        if (trimmed) scopeComments[key] = trimmed;
        else delete scopeComments[key];
        return { ...prev, scopeComments };
      });
    },
    [update],
  );

  const getMidLongTermPlan = useCallback(
    () => data.midLongTermPlan ?? createDefaultPlan(),
    [data.midLongTermPlan],
  );

  const setMidLongTermPlan = useCallback(
    (plan: MidLongTermPlan) => {
      update((prev) => ({ ...prev, midLongTermPlan: plan }));
    },
    [update],
  );

  const getLifePhilosophy = useCallback(
    () => normalizeLifePhilosophy(data.lifePhilosophy),
    [data.lifePhilosophy],
  );

  const updateLifePhilosophy = useCallback(
    (partial: Partial<LifePhilosophy>) => {
      update((prev) => ({
        ...prev,
        lifePhilosophy: normalizeLifePhilosophy({
          ...normalizeLifePhilosophy(prev.lifePhilosophy),
          ...partial,
        }),
      }));
    },
    [update],
  );

  const getPurposeVision = useCallback(
    () => normalizePurposeVision(data.purposeVision),
    [data.purposeVision],
  );

  const updatePurposeVision = useCallback(
    (partial: Partial<PurposeVision>) => {
      update((prev) => ({
        ...prev,
        purposeVision: normalizePurposeVision({
          ...normalizePurposeVision(prev.purposeVision),
          ...partial,
        }),
      }));
    },
    [update],
  );

  const getMy100YearHistory = useCallback(
    () => normalizeMy100YearHistory(data.my100YearHistory),
    [data.my100YearHistory],
  );

  const updateMy100YearHistory = useCallback(
    (partial: Partial<My100YearHistory>) => {
      update((prev) => ({
        ...prev,
        my100YearHistory: normalizeMy100YearHistory({
          ...normalizeMy100YearHistory(prev.my100YearHistory),
          ...partial,
        }),
      }));
    },
    [update],
  );

  const getLifeWishList100 = useCallback(
    () => normalizeLifeWishList100(data.lifeWishList100),
    [data.lifeWishList100],
  );

  const updateLifeWishList100 = useCallback(
    (partial: Partial<LifeWishList100>) => {
      update((prev) => ({
        ...prev,
        lifeWishList100: normalizeLifeWishList100({
          ...normalizeLifeWishList100(prev.lifeWishList100),
          ...partial,
        }),
      }));
    },
    [update],
  );

  const getGoalSetting = useCallback(
    () => normalizeGoalSetting(data.goalSetting),
    [data.goalSetting],
  );

  const updateGoalSetting = useCallback(
    (partial: Partial<GoalSetting>) => {
      update((prev) => ({
        ...prev,
        goalSetting: normalizeGoalSetting({
          ...normalizeGoalSetting(prev.goalSetting),
          ...partial,
        }),
      }));
    },
    [update],
  );

  const getMonthlyWorksheet = useCallback(
    (key: string, year: number, month: number) => {
      const sheets = data.monthlyWorksheets ?? {};
      return normalizeMonthlyWorksheet(sheets[key], year, month);
    },
    [data.monthlyWorksheets],
  );

  const updateMonthlyWorksheet = useCallback(
    (
      key: string,
      year: number,
      month: number,
      partial: Partial<MonthlyWorksheet>,
    ) => {
      update((prev) => {
        const sheets = { ...(prev.monthlyWorksheets ?? {}) };
        const current = normalizeMonthlyWorksheet(sheets[key], year, month);
        sheets[key] = normalizeMonthlyWorksheet(
          { ...current, ...partial },
          year,
          month,
        );
        return { ...prev, monthlyWorksheets: sheets };
      });
    },
    [update],
  );

  const getDailyWorksheet = useCallback(
    (key: string) => {
      const sheets = data.dailyWorksheets ?? {};
      return normalizeDailyWorksheet(sheets[key]);
    },
    [data.dailyWorksheets],
  );

  const updateDailyWorksheet = useCallback(
    (key: string, partial: Partial<DailyWorksheet>) => {
      update((prev) => {
        const sheets = { ...(prev.dailyWorksheets ?? {}) };
        const current = normalizeDailyWorksheet(sheets[key]);
        sheets[key] = normalizeDailyWorksheet({ ...current, ...partial });
        return { ...prev, dailyWorksheets: sheets };
      });
    },
    [update],
  );

  const getWeeklyWorksheet = useCallback(
    (key: string, weekMonday: Date) => {
      const sheets = data.weeklyWorksheets ?? {};
      return normalizeWeeklyWorksheet(sheets[key], weekMonday);
    },
    [data.weeklyWorksheets],
  );

  const updateWeeklyWorksheet = useCallback(
    (key: string, weekMonday: Date, partial: Partial<WeeklyWorksheet>) => {
      update((prev) => {
        const sheets = { ...(prev.weeklyWorksheets ?? {}) };
        const current = normalizeWeeklyWorksheet(sheets[key], weekMonday);
        sheets[key] = normalizeWeeklyWorksheet(
          { ...current, ...partial },
          weekMonday,
        );
        return { ...prev, weeklyWorksheets: sheets };
      });
    },
    [update],
  );

  const getPrimeTimeSheetData = useCallback(
    () => normalizePrimeTimeSheetData(data.primeTimeSheet),
    [data.primeTimeSheet],
  );

  const getActivePrimeTimeSheetPageCb = useCallback(
    () => getActivePrimeTimeSheetPage(getPrimeTimeSheetData()),
    [getPrimeTimeSheetData],
  );

  const updatePrimeTimeSheetPage = useCallback(
    (
      pageId: string,
      partial: Partial<PrimeTimeSheetContent> & { title?: string },
    ) => {
      update((prev) => {
        const current = normalizePrimeTimeSheetData(prev.primeTimeSheet);
        const pages = current.pages.map((page) => {
          if (page.id !== pageId) return page;
          const { title, ...contentPartial } = partial;
          const content = normalizePrimeTimeSheetContent({
            ...page,
            ...contentPartial,
          });
          return {
            ...page,
            ...content,
            title:
              title !== undefined
                ? title.trim() || suggestPageTitle(content, 1)
                : page.title,
          };
        });
        return {
          ...prev,
          primeTimeSheet: normalizePrimeTimeSheetData({
            ...current,
            pages,
          }),
        };
      });
    },
    [update],
  );

  const addPrimeTimeSheetPage = useCallback(() => {
    update((prev) => {
      const current = normalizePrimeTimeSheetData(prev.primeTimeSheet);
      const content = createEmptyPrimeTimeSheetContent();
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `page-${Date.now()}`;
      const index = current.pages.length + 1;
      const page: PrimeTimeSheetPage = {
        id,
        title: suggestPageTitle(content, index),
        ...content,
      };
      return {
        ...prev,
        primeTimeSheet: {
          activePageId: id,
          pages: [...current.pages, page],
        },
      };
    });
  }, [update]);

  const deletePrimeTimeSheetPage = useCallback(
    (pageId: string) => {
      update((prev) => {
        const current = normalizePrimeTimeSheetData(prev.primeTimeSheet);
        if (current.pages.length <= 1) return prev;
        const pages = current.pages.filter((p) => p.id !== pageId);
        const activePageId =
          current.activePageId === pageId
            ? (pages[0]?.id ?? "")
            : current.activePageId;
        return {
          ...prev,
          primeTimeSheet: { activePageId, pages },
        };
      });
    },
    [update],
  );

  const setActivePrimeTimeSheetPage = useCallback(
    (pageId: string) => {
      update((prev) => {
        const current = normalizePrimeTimeSheetData(prev.primeTimeSheet);
        if (!current.pages.some((p) => p.id === pageId)) return prev;
        return {
          ...prev,
          primeTimeSheet: { ...current, activePageId: pageId },
        };
      });
    },
    [update],
  );

  const importData = useCallback(
    (partial: Partial<AppData>) => {
      const normalized = normalizeAppData(partial);
      update((prev) => ({
        ...prev,
        events: mergeImportEvents(prev.events, normalized.events),
        northStar: mergeNorthStar(prev.northStar, normalized.northStar),
        scopeComments: { ...prev.scopeComments, ...normalized.scopeComments },
        midLongTermPlan:
          normalized.midLongTermPlan ?? prev.midLongTermPlan,
        lifePhilosophy: normalized.lifePhilosophy
          ? normalizeLifePhilosophy({
              ...normalizeLifePhilosophy(prev.lifePhilosophy),
              ...normalized.lifePhilosophy,
            })
          : prev.lifePhilosophy,
        purposeVision: normalized.purposeVision
          ? normalizePurposeVision({
              ...normalizePurposeVision(prev.purposeVision),
              ...normalized.purposeVision,
            })
          : prev.purposeVision,
        my100YearHistory: normalized.my100YearHistory
          ? normalizeMy100YearHistory({
              ...normalizeMy100YearHistory(prev.my100YearHistory),
              ...normalized.my100YearHistory,
            })
          : prev.my100YearHistory,
        lifeWishList100: normalized.lifeWishList100
          ? normalizeLifeWishList100({
              ...normalizeLifeWishList100(prev.lifeWishList100),
              ...normalized.lifeWishList100,
            })
          : prev.lifeWishList100,
        goalSetting: normalized.goalSetting
          ? normalizeGoalSetting({
              ...normalizeGoalSetting(prev.goalSetting),
              ...normalized.goalSetting,
            })
          : prev.goalSetting,
        monthlyWorksheets: normalized.monthlyWorksheets
          ? {
              ...normalizeMonthlyWorksheets(prev.monthlyWorksheets),
              ...normalizeMonthlyWorksheets(normalized.monthlyWorksheets),
            }
          : prev.monthlyWorksheets,
        dailyWorksheets: normalized.dailyWorksheets
          ? {
              ...normalizeDailyWorksheets(prev.dailyWorksheets),
              ...normalizeDailyWorksheets(normalized.dailyWorksheets),
            }
          : prev.dailyWorksheets,
        weeklyWorksheets: normalized.weeklyWorksheets
          ? {
              ...normalizeWeeklyWorksheets(prev.weeklyWorksheets),
              ...normalizeWeeklyWorksheets(normalized.weeklyWorksheets),
            }
          : prev.weeklyWorksheets,
        primeTimeSheet: normalized.primeTimeSheet
          ? (() => {
              const prevPts = normalizePrimeTimeSheetData(prev.primeTimeSheet);
              const newPts = normalizePrimeTimeSheetData(
                normalized.primeTimeSheet,
              );
              const byId = new Map(prevPts.pages.map((p) => [p.id, p]));
              for (const p of newPts.pages) byId.set(p.id, p);
              const pages = [...byId.values()];
              const activePageId = pages.some(
                (p) => p.id === newPts.activePageId,
              )
                ? newPts.activePageId
                : prevPts.activePageId;
              return normalizePrimeTimeSheetData({ activePageId, pages });
            })()
          : prev.primeTimeSheet,
      }));
    },
    [update],
  );

  const exportData = useCallback(() => data, [data]);

  const value = useMemo(
    () => ({
      data,
      eventsForDate,
      upsertEvent,
      deleteEvent,
      upsertNorthStar,
      deleteNorthStar,
      northStarFor,
      getScopeComment,
      setScopeComment,
      getMidLongTermPlan,
      setMidLongTermPlan,
      getLifePhilosophy,
      updateLifePhilosophy,
      getPurposeVision,
      updatePurposeVision,
      getMy100YearHistory,
      updateMy100YearHistory,
      getLifeWishList100,
      updateLifeWishList100,
      getGoalSetting,
      updateGoalSetting,
      getMonthlyWorksheet,
      updateMonthlyWorksheet,
      getDailyWorksheet,
      updateDailyWorksheet,
      getWeeklyWorksheet,
      updateWeeklyWorksheet,
      getPrimeTimeSheetData,
      getActivePrimeTimeSheetPage: getActivePrimeTimeSheetPageCb,
      updatePrimeTimeSheetPage,
      addPrimeTimeSheetPage,
      deletePrimeTimeSheetPage,
      setActivePrimeTimeSheetPage,
      importData,
      exportData,
    }),
    [
      data,
      eventsForDate,
      upsertEvent,
      deleteEvent,
      upsertNorthStar,
      deleteNorthStar,
      northStarFor,
      getScopeComment,
      setScopeComment,
      getMidLongTermPlan,
      setMidLongTermPlan,
      getLifePhilosophy,
      updateLifePhilosophy,
      getPurposeVision,
      updatePurposeVision,
      getMy100YearHistory,
      updateMy100YearHistory,
      getLifeWishList100,
      updateLifeWishList100,
      getGoalSetting,
      updateGoalSetting,
      getMonthlyWorksheet,
      updateMonthlyWorksheet,
      getDailyWorksheet,
      updateDailyWorksheet,
      getWeeklyWorksheet,
      updateWeeklyWorksheet,
      getPrimeTimeSheetData,
      getActivePrimeTimeSheetPageCb,
      updatePrimeTimeSheetPage,
      addPrimeTimeSheetPage,
      deletePrimeTimeSheetPage,
      setActivePrimeTimeSheetPage,
      importData,
      exportData,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

function compareEvents(a: CalendarEvent, b: CalendarEvent): number {
  if (a.kind === "allDay" && b.kind !== "allDay") return -1;
  if (a.kind !== "allDay" && b.kind === "allDay") return 1;
  return (a.startMin ?? 0) - (b.startMin ?? 0);
}

function mergeNorthStar(
  existing: NorthStarItem[],
  incoming: NorthStarItem[],
): NorthStarItem[] {
  const byId = new Map(existing.map((n) => [n.id, n]));
  for (const item of incoming) {
    if (item.id) byId.set(item.id, item);
  }
  return [...byId.values()];
}
