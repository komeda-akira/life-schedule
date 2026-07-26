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
  onMoreDetails: (draft: {
    title: string;
    startMin: number;
    endMin: number;
  }) => void;
};

const UNTITLED = "（タイトルなし）";

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
    const trimmed = title.trim() || UNTITLED;
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
      className="fixed inset-0 z-[60]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Googleカレンダー風: 中央寄せの薄いカード（カレンダー上のドラフトは残したまま） */}
      <div
        role="dialog"
        aria-label="予定を追加"
        className="absolute top-[min(28vh,12rem)] left-1/2 w-[min(100%-1.5rem,22rem)] -translate-x-1/2 rounded-2xl border border-zinc-200/80 bg-white shadow-[0_8px_28px_rgba(60,64,67,0.28)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2 border-b border-zinc-100 px-4 pt-4 pb-2">
          <div className="min-w-0 flex-1">
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
              placeholder="タイトルを追加"
              className="w-full border-0 bg-transparent text-lg font-medium text-black outline-none placeholder:text-black/35"
            />
            <p className="mt-1 text-sm text-black/55">
              {formatMinutesRange(startMin, endMin)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-black/45 hover:bg-zinc-100 hover:text-black"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1765cc]"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() =>
              onMoreDetails({
                title: title.trim(),
                startMin,
                endMin,
              })
            }
            className="rounded-full px-3 py-2 text-sm font-medium text-[#1a73e8] hover:bg-blue-50"
          >
            詳細オプション
          </button>
        </div>
      </div>
    </div>
  );
}
