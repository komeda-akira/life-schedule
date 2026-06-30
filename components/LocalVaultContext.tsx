"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { AppData } from "@/lib/types";

export type LocalVaultContextValue = {
  bootData: AppData;
  lock: () => Promise<void>;
  saveEncrypted: (data: AppData) => Promise<void>;
  changePassword: (currentPassword: string, nextPassword: string, data: AppData) => Promise<void>;
  registerFlushSave: (fn: () => Promise<void>) => () => void;
};

const LocalVaultContext = createContext<LocalVaultContextValue | null>(null);

export function LocalVaultContextProvider({
  bootData,
  onLock,
  saveEncrypted,
  changePassword,
  registerFlushSave,
  children,
}: {
  bootData: AppData;
  onLock: () => Promise<void>;
  saveEncrypted: (data: AppData) => Promise<void>;
  changePassword: (
    currentPassword: string,
    nextPassword: string,
    data: AppData,
  ) => Promise<void>;
  registerFlushSave: (fn: () => Promise<void>) => () => void;
  children: ReactNode;
}) {
  const value = useMemo<LocalVaultContextValue>(
    () => ({
      bootData,
      lock: onLock,
      saveEncrypted,
      changePassword,
      registerFlushSave,
    }),
    [bootData, onLock, saveEncrypted, changePassword, registerFlushSave],
  );

  return (
    <LocalVaultContext.Provider value={value}>
      {children}
    </LocalVaultContext.Provider>
  );
}

export function useLocalVault(): LocalVaultContextValue | null {
  return useContext(LocalVaultContext);
}
