"use client";

import { useCallback, useMemo, useState } from "react";
import { EventModal } from "@/components/EventModal";
import { useAppData } from "@/components/AppDataProvider";
import { useCalendarCursor } from "@/components/CalendarNavigation";
import {
  buildMonthGridDays,
  isToday,
  MONDAY_WEEKDAY_LABELS,
  startOfDay,
  weekdayTextClass,
} from "@/lib/calendar";
import {
  eventTimelineColorClass,
  formatMinutesClock,
} from "@/lib/day-schedule";
import { isMultiDayEvent } from "@/lib/event-span";
import { formatDateKey } from "@/lib/scope-keys";
import type { CalendarEvent, EventKind } from "@/lib/types";

const MAX_CHIPS_COLLAPSED = 3;

type EventDraft = {
  dateKey: string;
  event: CalendarEvent | null;
  defaultKind?: EventKind;
};

type MonthCalendarGridProps = {
  year: number;
  /** 1–12 */
  month: number;
  /** 背面の週・日ペインと連動するカーソル更新 */
  onSelectDay?: (date: Date) => void;
};

function sortDayEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    if (a.kind === "allDay" && b.kind !== "allDay") return -1;
    if (a.kind !== "allDay" && b.kind === "allDay") return 1;
    if (isMultiDayEvent(a) && !isMultiDayEvent(b)) return -1;
    if (!isMultiDayEvent(a) && isMultiDayEvent(b)) return 1;
    const aStart = a.startMin ?? 0;
    const bStart = b.startMin ?? 0;
    return aStart - bStart || a.title.localeCompare(b.title, "ja");
  });
}

function chipLabel(ev: CalendarEvent): string {
  if (ev.kind === "allDay" || isMultiDayEvent(ev)) {
    return ev.title;
  }
  if (typeof ev.startMin === "number") {
    return `${formatMinutesClock(ev.startMin)} ${ev.title}`;
  }
  return ev.title;
}

export function MonthCalendarGrid({
  year,
  month,
  onSelectDay,
}: MonthCalendarGridProps) {
  const { eventsForDate } = useAppData();
  const cursor = useCalendarCursor();
  const days = useMemo(() => buildMonthGridDays(year, month), [year, month]);
  const [selectedKey, setSelectedKey] = useState<string | null>(() =>
    formatDateKey(cursor),
  );
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState<EventDraft | null>(null);

  const openEvent = useCallback((draft: EventDraft) => {
    setEventDraft(draft);
  }, []);

  const selectDay = useCallback(
    (d: Date) => {
      const key = formatDateKey(d);
      setSelectedKey(key);
      onSelectDay?.(startOfDay(d));
    },
    [onSelectDay],
  );

  const onCellClick = useCallback(
    (d: Date) => {
      const key = formatDateKey(d);
      selectDay(d);
      openEvent({
        dateKey: key,
        event: null,
        defaultKind: "allDay",
      });
    },
    [openEvent, selectDay],
  );

  const onChipClick = useCallback(
    (d: Date, ev: CalendarEvent) => {
      const key = formatDateKey(d);
      selectDay(d);
      openEvent({ dateKey: key, event: ev });
    },
    [openEvent, selectDay],
  );

  const onMoreClick = useCallback(
    (d: Date) => {
      const key = formatDateKey(d);
      selectDay(d);
      setExpandedKey((prev) => (prev === key ? null : key));
    },
    [selectDay],
  );

  return (
    <div className="flex flex-col gap-2 text-black">
      <p className="text-[11px] text-black/55">
        空き枠をクリックで終日予定を追加。予定をクリックで編集。週次・日次と連動します。
      </p>

      <div className="overflow-hidden rounded border border-zinc-300 bg-white">
        <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
          {MONDAY_WEEKDAY_LABELS.map((label, i) => {
            const sample = days[i]!;
            return (
              <div
                key={label}
                className={`px-1 py-1.5 text-center text-xs font-medium ${weekdayTextClass(sample)}`}
              >
                {label}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((d) => {
            const key = formatDateKey(d);
            const inMonth = d.getMonth() === month - 1;
            const today = isToday(d);
            const selected = selectedKey === key;
            const dayEvents = sortDayEvents(eventsForDate(key));
            const expanded = expandedKey === key;
            const visible = expanded
              ? dayEvents
              : dayEvents.slice(0, MAX_CHIPS_COLLAPSED);
            const overflow = dayEvents.length - visible.length;

            return (
              <div
                key={key}
                className={`relative flex min-h-[6.5rem] flex-col border-b border-r border-zinc-200 p-1 last:border-r-0 sm:min-h-[7.5rem] ${
                  inMonth ? "bg-white" : "bg-zinc-50/80"
                } ${selected ? "bg-blue-50/40" : ""}`}
              >
                <div className="relative z-10 mb-0.5 flex items-center justify-between gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectDay(d);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      selectDay(d);
                    }}
                    className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-medium ${
                      today
                        ? "bg-[#1a73e8] text-white"
                        : inMonth
                          ? weekdayTextClass(d)
                          : "text-black/35"
                    } ${selected && !today ? "ring-1 ring-[#1a73e8]/40" : ""}`}
                    aria-label={`${d.getMonth() + 1}月${d.getDate()}日`}
                  >
                    {d.getDate()}
                  </button>
                </div>

                <button
                  type="button"
                  className="absolute inset-0 z-0"
                  aria-label={`${d.getMonth() + 1}月${d.getDate()}日に予定を追加`}
                  onClick={() => onCellClick(d)}
                />

                <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                  {visible.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChipClick(d, ev);
                      }}
                      className={`truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight sm:text-[11px] ${eventTimelineColorClass(ev.id)}`}
                      title={chipLabel(ev)}
                    >
                      {chipLabel(ev)}
                    </button>
                  ))}
                  {overflow > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoreClick(d);
                      }}
                      className="truncate px-1 py-0.5 text-left text-[10px] font-medium text-[#1a73e8] hover:underline sm:text-[11px]"
                    >
                      他 {overflow} 件
                    </button>
                  ) : null}
                  {expanded && dayEvents.length > MAX_CHIPS_COLLAPSED ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedKey(null);
                      }}
                      className="truncate px-1 py-0.5 text-left text-[10px] text-black/50 hover:underline sm:text-[11px]"
                    >
                      閉じる
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {eventDraft ? (
        <EventModal
          event={eventDraft.event}
          dateKey={eventDraft.dateKey}
          defaultKind={eventDraft.defaultKind}
          onClose={() => setEventDraft(null)}
        />
      ) : null}
    </div>
  );
}
