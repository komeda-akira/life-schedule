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
import {
  loadAppData,
  mergeImportEvents,
  normalizeAppData,
  saveAppData,
} from "@/lib/storage";
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
  importData: (partial: Partial<AppData>) => void;
  exportData: () => AppData;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadAppData());
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

  const importData = useCallback(
    (partial: Partial<AppData>) => {
      const normalized = normalizeAppData(partial);
      update((prev) => ({
        ...prev,
        events: mergeImportEvents(prev.events, normalized.events),
        northStar: mergeNorthStar(prev.northStar, normalized.northStar),
        scopeComments: { ...prev.scopeComments, ...normalized.scopeComments },
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
