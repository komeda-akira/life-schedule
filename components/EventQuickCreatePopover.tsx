"use client";

import { useEffect, useRef, useState } from "react";
import { useAppData } from "@/components/AppDataProvider";
import { formatMinutesRange } from "@/lib/day-schedule";
import type { CalendarEvent } from "@/lib/types";

type EventQuickCreatePopoverProps = {
  dateKey: string;
  startMin: number;
  endMin: number;
  onClose: () => void;
  onMoreDetails: (draft: { title: string; startMin: number; endMin: number }) => void;
};

export function EventQuickCreatePopover({
  dateKey,
  startMin,
  endMin,
  onClose,
  onMoreDetails,
}: EventQuickCreatePopoverProps) {
  const { upsertEvent } = useAppData();
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      title: trimmed,
      date: dateKey,
      kind: "timed",
      startMin,
      endMin,
      createdAt: now,
    };
    upsertEvent(event);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/20 p-4 pt-[12vh] sm:items-center sm:pt-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="予定を追加"
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-3 py-2">
          <p className="text-xs font-medium text-black/55">新しい予定</p>
          <p className="text-sm font-semibold text-black">
            {formatMinutesRange(startMin, endMin)}
          </p>
        </div>
        <div className="p-3">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              }
            }}
            placeholder="タイトルを入力"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!title.trim()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() =>
                onMoreDetails({ title: title.trim(), startMin, endMin })
              }
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-black hover:bg-zinc-50"
            >
              詳細を編集
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-md px-2 py-1.5 text-sm text-black/60 hover:text-black"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
