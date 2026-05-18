"use client";

import { useRef } from "react";
import { useAppData } from "@/components/AppDataProvider";
import { downloadJson, normalizeAppData } from "@/lib/storage";
import type { AppData } from "@/lib/types";

export function DataMenu() {
  const { exportData, importData } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => downloadJson(exportData());

  const onImport = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as Partial<AppData>;
    importData(normalizeAppData(parsed));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExport}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
      >
        JSONを書き出す
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
      >
        JSONを読み込む
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onImport(f).catch(() => alert("JSONの読み込みに失敗しました。"));
          e.target.value = "";
        }}
      />
    </div>
  );
}
