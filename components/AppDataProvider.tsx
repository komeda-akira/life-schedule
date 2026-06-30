"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { MigrateLocalDataModal } from "@/components/MigrateLocalDataModal";
import {
  clearLocalAppData,
  hasLocalAppData,
  readRawLocalAppData,
} from "@/lib/local-storage";
import { useLocalVault } from "@/components/LocalVaultContext";
import { isCloudStorageMode, isLocalPlainStorageMode, isLocalVaultStorageMode } from "@/lib/storage-mode";
import { unlockVault } from "@/lib/local-vault";
import {
  bootstrapAppData,
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
import {
  eventsForDateExpanded,
  parseInstanceEventId,
  searchEventsInStore,
} from "@/lib/recurrence";

export type EventEditScope = "single" | "all";

type AppDataContextValue = {
  data: AppData;
  eventsForDate: (dateKey: string) => CalendarEvent[];
  searchEvents: (query: string) => CalendarEvent[];
  upsertEvent: (event: CalendarEvent, scope?: EventEditScope) => void;
  deleteEvent: (id: string, scope?: EventEditScope) => void;
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

const SAVE_DEBOUNCE_MS = 800;

async function fetchRemoteAppData(): Promise<{
  exists: boolean;
  data: AppData | null;
}> {
  const res = await fetch("/api/app-data");
  if (!res.ok) {
    throw new Error("Failed to load app data");
  }
  return (await res.json()) as { exists: boolean; data: AppData | null };
}

async function persistRemoteAppData(data: AppData): Promise<void> {
  const res = await fetch("/api/app-data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to save app data");
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const vault = useLocalVault();
  const [data, setData] = useState<AppData>(createEmptyAppData);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [migrateBusy, setMigrateBusy] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (isLocalVaultStorageMode()) {
        if (!vault) return;
        try {
          const unlocked = await unlockVault(vault.password);
          if (cancelled) return;
          setData(applyNorthStarScreenshotDefaults(normalizeAppData(unlocked)));
          setHydrated(true);
        } catch {
          if (!cancelled) {
            setLoadError("データを復号できませんでした。ロックして再度ログインしてください。");
          }
        }
        return;
      }

      if (isLocalPlainStorageMode()) {
        setData(loadAppData());
        setHydrated(true);
        return;
      }

      try {
        const remote = await fetchRemoteAppData();
        if (cancelled) return;

        if (remote.exists && remote.data) {
          setData(
            applyNorthStarScreenshotDefaults(normalizeAppData(remote.data)),
          );
          setHydrated(true);
          return;
        }

        if (hasLocalAppData()) {
          setData(bootstrapAppData());
          setMigrateOpen(true);
          setHydrated(true);
          return;
        }

        setData(bootstrapAppData());
        setHydrated(true);
      } catch {
        if (!cancelled) {
          setLoadError("クラウドからデータを読み込めませんでした。");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [vault]);

  useEffect(() => {
    if (!hydrated || migrateOpen) return;

    if (isLocalVaultStorageMode()) {
      if (!vault) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        void vault.saveEncrypted(data).catch(() => {
          setLoadError("このPCへの保存に失敗しました。");
        });
      }, SAVE_DEBOUNCE_MS);
      return () => {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
      };
    }

    if (isLocalPlainStorageMode()) {
      saveAppData(data);
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      void persistRemoteAppData(data).catch(() => {
        setLoadError("クラウドへの保存に失敗しました。");
      });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [data, hydrated, migrateOpen, vault]);

  const finishMigration = useCallback(async (next: AppData) => {
    setMigrateBusy(true);
    try {
      await persistRemoteAppData(next);
      clearLocalAppData();
      setData(applyNorthStarScreenshotDefaults(normalizeAppData(next)));
      setMigrateOpen(false);
      setLoadError(null);
    } catch {
      setLoadError("移行に失敗しました。もう一度お試しください。");
    } finally {
      setMigrateBusy(false);
    }
  }, []);

  const onMigrateLocal = useCallback(() => {
    const raw = readRawLocalAppData();
    void finishMigration(normalizeAppData(raw ?? {}));
  }, [finishMigration]);

  const onSkipMigration = useCallback(() => {
    void finishMigration(bootstrapAppData());
  }, [finishMigration]);

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const eventsForDate = useCallback(
    (dateKey: string) =>
      eventsForDateExpanded(data.events, dateKey).sort(compareEvents),
    [data.events],
  );

  const searchEvents = useCallback(
    (query: string) => searchEventsInStore(data.events, query),
    [data.events],
  );

  const upsertEvent = useCallback(
    (event: CalendarEvent, scope: EventEditScope = "all") => {
      update((prev) => {
        const parsed = parseInstanceEventId(event.id);
        if (parsed && scope === "single") {
          const exception: CalendarEvent = {
            ...event,
            id: crypto.randomUUID(),
            recurrenceId: parsed.masterId,
            recurrence: undefined,
            recurrenceSkipDates: undefined,
            date: parsed.dateKey,
          };
          const rest = prev.events.filter(
            (e) =>
              e.id !== event.id &&
              !(
                e.recurrenceId === parsed.masterId &&
                e.date === parsed.dateKey
              ),
          );
          return { ...prev, events: [...rest, exception] };
        }

        if (parsed && scope === "all") {
          const masterId = parsed.masterId;
          const rest = prev.events.filter(
            (e) =>
              e.id !== masterId &&
              e.recurrenceId !== masterId &&
              e.id !== event.id,
          );
          const master: CalendarEvent = {
            ...event,
            id: masterId,
            date: prev.events.find((e) => e.id === masterId)?.date ?? event.date,
            recurrenceId: undefined,
          };
          return { ...prev, events: [...rest, master] };
        }

        const rest = prev.events.filter((e) => e.id !== event.id);
        return { ...prev, events: [...rest, event] };
      });
    },
    [update],
  );

  const deleteEvent = useCallback(
    (id: string, scope: EventEditScope = "all") => {
      update((prev) => {
        const parsed = parseInstanceEventId(id);
        if (parsed && scope === "single") {
          const master = prev.events.find((e) => e.id === parsed.masterId);
          if (!master) {
            return {
              ...prev,
              events: prev.events.filter((e) => e.id !== id),
            };
          }
          const skips = new Set(master.recurrenceSkipDates ?? []);
          skips.add(parsed.dateKey);
          const nextMaster: CalendarEvent = {
            ...master,
            recurrenceSkipDates: [...skips],
          };
          return {
            ...prev,
            events: prev.events
              .filter(
                (e) =>
                  e.id !== id &&
                  !(
                    e.recurrenceId === parsed.masterId &&
                    e.date === parsed.dateKey
                  ),
              )
              .map((e) => (e.id === parsed.masterId ? nextMaster : e)),
          };
        }

        const masterId = parsed?.masterId ?? id;
        return {
          ...prev,
          events: prev.events.filter(
            (e) => e.id !== masterId && e.recurrenceId !== masterId && e.id !== id,
          ),
        };
      });
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
            title: title !== undefined ? title : page.title,
          };
        });
        return {
          ...prev,
          primeTimeSheet: {
            ...current,
            pages,
          },
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
      const page: PrimeTimeSheetPage = {
        id,
        title: "",
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
      searchEvents,
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
      searchEvents,
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

  if (loadError && !hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <p className="text-center text-sm text-red-700">{loadError}</p>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <p className="text-sm text-black/60">データを読み込み中…</p>
      </div>
    );
  }

  return (
    <AppDataContext.Provider value={value}>
      {loadError ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          {loadError}
        </div>
      ) : null}
      {children}
      {migrateOpen ? (
        <MigrateLocalDataModal
          busy={migrateBusy}
          onMigrate={onMigrateLocal}
          onSkip={onSkipMigration}
        />
      ) : null}
    </AppDataContext.Provider>
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
