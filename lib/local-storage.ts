import type { AppData } from "@/lib/types";

export const STORAGE_KEY = "life-schedule:v1";

export function readRawLocalAppData(): Partial<AppData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AppData>;
  } catch {
    return null;
  }
}

export function hasLocalAppData(): boolean {
  return readRawLocalAppData() !== null;
}

export function clearLocalAppData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
