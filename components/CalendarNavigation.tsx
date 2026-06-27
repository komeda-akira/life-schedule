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

type CalendarNavigationContextValue = {
  jumpToDate: (dateKey: string) => void;
  registerJumpHandler: (fn: (dateKey: string) => void) => void;
};

const CalendarNavigationContext =
  createContext<CalendarNavigationContextValue | null>(null);

export function CalendarNavigationProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<((dateKey: string) => void) | null>(null);

  const registerJumpHandler = useCallback((fn: (dateKey: string) => void) => {
    handlerRef.current = fn;
  }, []);

  const jumpToDate = useCallback((dateKey: string) => {
    handlerRef.current?.(dateKey);
  }, []);

  return (
    <CalendarNavigationContext.Provider
      value={{ jumpToDate, registerJumpHandler }}
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

export function useRegisterCalendarJump(handler: (dateKey: string) => void) {
  const { registerJumpHandler } = useCalendarNavigation();
  useEffect(() => {
    registerJumpHandler(handler);
  }, [registerJumpHandler, handler]);
}
