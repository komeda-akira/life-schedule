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
