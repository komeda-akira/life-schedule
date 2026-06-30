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
  lock: () => void;
  saveEncrypted: (data: AppData) => Promise<void>;
  changePassword: (currentPassword: string, nextPassword: string, data: AppData) => Promise<void>;
};

const LocalVaultContext = createContext<LocalVaultContextValue | null>(null);

export function LocalVaultContextProvider({
  bootData,
  onLock,
  saveEncrypted,
  changePassword,
  children,
}: {
  bootData: AppData;
  onLock: () => void;
  saveEncrypted: (data: AppData) => Promise<void>;
  changePassword: (
    currentPassword: string,
    nextPassword: string,
    data: AppData,
  ) => Promise<void>;
  children: ReactNode;
}) {
  const value = useMemo<LocalVaultContextValue>(
    () => ({
      bootData,
      lock: onLock,
      saveEncrypted,
      changePassword,
    }),
    [bootData, onLock, saveEncrypted, changePassword],
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
