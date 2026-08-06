"use client";

import { useCallback, useMemo, useState } from "react";
import { EventModal } from "@/components/EventModal";
import { useAppData } from "@/components/AppDataProvider";
import { useCalendarCursor } from "@/components/CalendarNavigation";
import {
  buildMonthGridDays,
  isToday,
  startOfDay,
  SUNDAY_WEEKDAY_LABELS,
} from "@/lib/calendar";
import {
  eventMonthBannerClass,
  eventMonthDotClass,
  formatMinutesGoogleMonth,
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
  /** 「今日」など、表示月も合わせて移動 */
  onGoToDate?: (date: Date) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
};

function sortDayEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aBanner = a.kind === "allDay" || isMultiDayEvent(a);
    const bBanner = b.kind === "allDay" || isMultiDayEvent(b);
    if (aBanner && !bBanner) return -1;
    if (!aBanner && bBanner) return 1;
    const aStart = a.startMin ?? 0;
    const bStart = b.startMin ?? 0;
    return aStart - bStart || a.title.localeCompare(b.title, "ja");
  });
}

function isBannerEvent(ev: CalendarEvent): boolean {
  return ev.kind === "allDay" || isMultiDayEvent(ev);
}

function weekdayHeaderClass(label: string): string {
  if (label === "日") return "text-[#d50000]";
  if (label === "土") return "text-[#1967d2]";
  return "text-[#70757a]";
}

export function MonthCalendarGrid({
  year,
  month,
  onSelectDay,
  onGoToDate,
  onPrevMonth,
  onNextMonth,
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

  const goToday = useCallback(() => {
    const today = startOfDay(new Date());
    setSelectedKey(formatDateKey(today));
    if (onGoToDate) onGoToDate(today);
    else onSelectDay?.(today);
  }, [onGoToDate, onSelectDay]);

  return (
    <div className="flex flex-col text-black">
      {/* Google カレンダー風ツールバー */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={goToday}
          className="rounded-full border border-[#dadce0] bg-white px-4 py-1.5 text-sm font-medium text-[#3c4043] hover:bg-[#f8f9fa]"
        >
          今日
        </button>
        {onPrevMonth || onNextMonth ? (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onPrevMonth}
              disabled={!onPrevMonth}
              aria-label="前月"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#3c4043] hover:bg-[#f1f3f4] disabled:opacity-40"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={onNextMonth}
              disabled={!onNextMonth}
              aria-label="翌月"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#3c4043] hover:bg-[#f1f3f4] disabled:opacity-40"
            >
              ›
            </button>
          </div>
        ) : null}
        <h3 className="text-xl font-normal tracking-tight text-[#3c4043] sm:text-2xl">
          {year}年 {month}月
        </h3>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#dadce0] bg-white">
        <div className="grid grid-cols-7 border-b border-[#dadce0]">
          {SUNDAY_WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className={`py-2 text-center text-xs font-medium ${weekdayHeaderClass(label)}`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((d, index) => {
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
            const isLastCol = index % 7 === 6;

            let dayNumClass = "text-[#3c4043]";
            if (!inMonth) dayNumClass = "text-[#70757a]";
            else if (d.getDay() === 0) dayNumClass = "text-[#d50000]";
            else if (d.getDay() === 6) dayNumClass = "text-[#1967d2]";

            return (
              <div
                key={key}
                className={`relative flex min-h-[5.75rem] flex-col border-b border-[#dadce0] sm:min-h-[6.75rem] lg:min-h-[7.5rem] ${
                  isLastCol ? "" : "border-r border-[#dadce0]"
                } ${selected && !today ? "bg-[#e8f0fe]/50" : "bg-white"}`}
              >
                <button
                  type="button"
                  className="absolute inset-0 z-0"
                  aria-label={`${d.getMonth() + 1}月${d.getDate()}日に予定を追加`}
                  onClick={() => onCellClick(d)}
                />

                <div className="relative z-10 flex justify-center pt-1.5 pb-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectDay(d);
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium sm:h-8 sm:w-8 sm:text-sm ${
                      today
                        ? "bg-[#1a73e8] text-white hover:bg-[#1765cc]"
                        : `${dayNumClass} hover:bg-[#f1f3f4]`
                    }`}
                    aria-label={`${d.getMonth() + 1}月${d.getDate()}日`}
                    aria-current={today ? "date" : undefined}
                  >
                    {d.getDate()}
                  </button>
                </div>

                <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-px overflow-hidden px-0.5 pb-0.5">
                  {visible.map((ev) => {
                    const banner = isBannerEvent(ev);
                    if (banner) {
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChipClick(d, ev);
                          }}
                          className={`truncate rounded-sm px-1.5 py-0.5 text-left text-[11px] leading-snug font-medium ${eventMonthBannerClass(ev.id)}`}
                          title={ev.title}
                        >
                          {ev.title}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChipClick(d, ev);
                        }}
                        className="flex min-w-0 items-center gap-1 rounded-sm px-0.5 py-0.5 text-left hover:bg-[#f1f3f4]"
                        title={
                          typeof ev.startMin === "number"
                            ? `${formatMinutesGoogleMonth(ev.startMin)} ${ev.title}`
                            : ev.title
                        }
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${eventMonthDotClass(ev.id)}`}
                          aria-hidden
                        />
                        <span className="min-w-0 truncate text-[11px] leading-snug text-[#3c4043]">
                          {typeof ev.startMin === "number" ? (
                            <>
                              <span className="text-[#70757a]">
                                {formatMinutesGoogleMonth(ev.startMin)}
                              </span>{" "}
                              {ev.title}
                            </>
                          ) : (
                            ev.title
                          )}
                        </span>
                      </button>
                    );
                  })}
                  {overflow > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoreClick(d);
                      }}
                      className="truncate px-1 py-0.5 text-left text-[11px] font-medium text-[#3c4043] hover:bg-[#f1f3f4] hover:underline"
                    >
                      他 {overflow} 件
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
