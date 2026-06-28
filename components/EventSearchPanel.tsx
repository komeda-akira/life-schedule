"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppData } from "@/components/AppDataProvider";
import type { CalendarEvent } from "@/lib/types";
import { formatEventDateRange, isMultiDayEvent } from "@/lib/event-span";
import { parseInstanceEventId } from "@/lib/recurrence";

type EventSearchPanelProps = {
  onJumpToDate: (dateKey: string, eventId?: string) => void;
};

function formatEventWhen(event: CalendarEvent): string {
  const dateLabel = isMultiDayEvent(event)
    ? formatEventDateRange(event)
    : event.date;
  if (event.kind === "allDay") return `${dateLabel} · 終日`;
  const s = event.startMin ?? 0;
  const e = event.endMin ?? s + 60;
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return `${dateLabel} · ${fmt(s)}–${fmt(e)}`;
}

export function EventSearchPanel({ onJumpToDate }: EventSearchPanelProps) {
  const { searchEvents } = useAppData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = query.trim() ? searchEvents(query) : [];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onSelect = useCallback(
    (event: CalendarEvent) => {
      onJumpToDate(event.date, event.id);
      setOpen(false);
      setQuery("");
    },
    [onJumpToDate],
  );

  return (
    <div ref={wrapRef} className="relative w-full min-w-[10rem] sm:w-44">
      <label className="sr-only" htmlFor="event-search">
        予定を検索
      </label>
      <input
        id="event-search"
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="予定を検索…"
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs text-black placeholder:text-black/40"
      />
      {open && query.trim() ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-black/50">該当なし</p>
          ) : (
            results.map((event) => (
              <button
                key={`${event.id}-${event.date}`}
                type="button"
                onClick={() => onSelect(event)}
                className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-zinc-50"
              >
                <span className="text-xs font-semibold text-black">
                  {event.title}
                </span>
                <span className="text-[10px] text-black/55">
                  {event.date} · {formatEventWhen(event)}
                  {parseInstanceEventId(event.id) || event.recurrenceId
                    ? " · 繰り返し"
                    : ""}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
