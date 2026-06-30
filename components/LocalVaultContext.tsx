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
  password: string;
  lock: () => void;
  saveEncrypted: (data: AppData) => Promise<void>;
  changePassword: (currentPassword: string, nextPassword: string, data: AppData) => Promise<void>;
};

const LocalVaultContext = createContext<LocalVaultContextValue | null>(null);

export function LocalVaultContextProvider({
  password,
  onLock,
  saveEncrypted,
  changePassword,
  children,
}: {
  password: string;
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
      password,
      lock: onLock,
      saveEncrypted,
      changePassword,
    }),
    [password, onLock, saveEncrypted, changePassword],
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
