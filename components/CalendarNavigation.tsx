"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CALENDAR_INITIAL_CURSOR } from "@/lib/calendar";

type CalendarNavigationContextValue = {
  jumpToDate: (dateKey: string) => void;
  registerJumpHandler: (fn: (dateKey: string) => void) => void;
  cursorDate: Date | null;
  setCursorDate: (date: Date) => void;
};

const CalendarNavigationContext =
  createContext<CalendarNavigationContextValue | null>(null);

export function CalendarNavigationProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<((dateKey: string) => void) | null>(null);
  const [cursorDate, setCursorDateState] = useState<Date | null>(
    CALENDAR_INITIAL_CURSOR,
  );

  const registerJumpHandler = useCallback((fn: (dateKey: string) => void) => {
    handlerRef.current = fn;
  }, []);

  const jumpToDate = useCallback((dateKey: string) => {
    handlerRef.current?.(dateKey);
  }, []);

  const setCursorDate = useCallback((date: Date) => {
    setCursorDateState(date);
  }, []);

  return (
    <CalendarNavigationContext.Provider
      value={{ jumpToDate, registerJumpHandler, cursorDate, setCursorDate }}
    >
      {children}
    </CalendarNavigationContext.Provider>
  );
}

export function useCalendarNavigation() {
  const ctx = useContext(CalendarNavigationContext);
  if (!ctx) {
    throw new Error(
      "useCalendarNavigation must be used within CalendarNavigationProvider",
    );
  }
  return ctx;
}

/** カレンダーの現在カーソル */
export function useCalendarCursor(): Date {
  return useCalendarNavigation().cursorDate ?? CALENDAR_INITIAL_CURSOR;
}

export function useRegisterCalendarJump(handler: (dateKey: string) => void) {
  const { registerJumpHandler } = useCalendarNavigation();
  useEffect(() => {
    registerJumpHandler(handler);
  }, [registerJumpHandler, handler]);
}
