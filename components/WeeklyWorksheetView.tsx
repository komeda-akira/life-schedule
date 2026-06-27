"use client";

import { useCallback, useMemo, useState } from "react";
import { useAppData } from "@/components/AppDataProvider";
import { EventModal } from "@/components/EventModal";
import { EventQuickCreatePopover } from "@/components/EventQuickCreatePopover";
import { WeekDayTimelineColumn } from "@/components/WeekDayTimelineColumn";
import { addDays, weekdayTextClass } from "@/lib/calendar";
import type { CalendarEvent, EventKind } from "@/lib/types";
import { formatDateKey } from "@/lib/scope-keys";
import type { WeeklyWorksheet } from "@/lib/weekly-worksheet";
import {
  scheduleHourLabel,
  WEEKLY_HOUR_ROW_COUNT,
  WEEKLY_TIMELINE_HEIGHT,
  WEEKLY_TIMELINE_ROW_PX,
} from "@/lib/weekly-worksheet";
import {
  WW_COL_DATE,
  WW_COL_MEMO,
  WW_COL_WEEKDAY,
  WW_DATE_RANGE,
  WW_FOOTER_NOTES,
  WW_SAVE_HINT,
  WW_SCHEDULE_HINT,
  WW_TITLE,
  WW_TOP_PRIORITY,
  WW_WEEKDAYS,
  WW_WEEKLY_GOALS,
} from "@/lib/weekly-worksheet-labels";

const cellInput =
  "h-full w-full resize-none border-0 bg-transparent px-0.5 py-0.5 text-xs leading-snug placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded";

const headerInput =
  "w-full border-0 border-b border-dashed border-zinc-400 bg-transparent px-1 py-1 text-sm text-black placeholder:text-black/30 focus:border-zinc-600 focus:outline-none";

const GRID_BOX_CLASS =
  "flex min-h-[34rem] flex-1 flex-col overflow-x-auto rounded border-2 border-zinc-800 lg:min-h-0";

const PANEL_TOP_CLASS = "flex shrink-0 flex-col gap-2 lg:min-h-[8.5rem]";

type EventDraft = {
  dateKey: string;
  event: CalendarEvent | null;
  defaultStartMin?: number;
  defaultEndMin?: number;
  defaultKind?: EventKind;
  prefilledTitle?: string;
};

function dayColorClass(weekMonday: Date, dayIndex: number): string {
  return weekdayTextClass(addDays(weekMonday, dayIndex));
}

type WeeklyWorksheetViewProps = {
  weekKey: string;
  weekMonday: Date;
};

function HourGrid({
  dayIndices,
  showMemo,
  weekMonday,
  data,
  eventsForDate,
  patchDay,
  patchMemo,
  onCreateRange,
  onUpdateRange,
  onEditEvent,
}: {
  dayIndices: number[];
  showMemo: boolean;
  weekMonday: Date;
  data: WeeklyWorksheet;
  eventsForDate: (dateKey: string) => CalendarEvent[];
  patchDay: (index: number, partial: Partial<WeeklyWorksheet["days"][number]>) => void;
  patchMemo: (rowIndex: number, value: string) => void;
  onCreateRange: (dateKey: string, startMin: number, endMin: number) => void;
  onUpdateRange: (dateKey: string, id: string, startMin: number, endMin: number) => void;
  onEditEvent: (dateKey: string, id: string) => void;
}) {
  return (
    <table className="h-full w-full table-fixed border-collapse text-xs">
      <thead>
        <tr className="bg-zinc-100">
          <th className="w-8 border border-zinc-800 px-0.5 py-1 font-bold" />
          {dayIndices.map((di) => (
            <th
              key={di}
              className={`border border-zinc-800 px-0.5 py-1 text-center font-bold ${dayColorClass(weekMonday, di)}`}
            >
              {WW_WEEKDAYS[di]}
            </th>
          ))}
          {showMemo ? (
            <th className="border border-zinc-800 px-0.5 py-1 text-center font-bold text-black">
              {WW_COL_MEMO}
            </th>
          ) : null}
        </tr>
        <tr className="bg-zinc-50">
          <th className="border border-zinc-800 px-0.5 py-0.5 text-[11px] font-medium text-black">
            {WW_COL_DATE}
          </th>
          {dayIndices.map((di) => (
            <td key={di} className="border border-zinc-800 p-0">
              <input
                type="text"
                value={data.days[di]?.dateLabel ?? ""}
                onChange={(e) => patchDay(di, { dateLabel: e.target.value })}
                className={`${cellInput} text-center font-medium ${dayColorClass(weekMonday, di)}`}
              />
            </td>
          ))}
          {showMemo ? (
            <td className="border border-zinc-800 bg-zinc-50" />
          ) : null}
        </tr>
        <tr className="bg-zinc-50">
          <th className="border border-zinc-800 px-0.5 py-0.5 text-[11px] font-medium text-black">
            {WW_COL_WEEKDAY}
          </th>
          {dayIndices.map((di) => (
            <td
              key={di}
              className={`border border-zinc-800 px-0.5 py-0.5 text-center font-medium ${dayColorClass(weekMonday, di)}`}
            >
              {WW_WEEKDAYS[di]}
            </td>
          ))}
          {showMemo ? (
            <td className="border border-zinc-800 bg-zinc-50" />
          ) : null}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            className="relative border border-zinc-300 p-0 align-top"
            style={{ height: WEEKLY_TIMELINE_HEIGHT }}
          >
            <div className="absolute inset-0">
              {Array.from({ length: WEEKLY_HOUR_ROW_COUNT }, (_, row) => (
                <div
                  key={row}
                  className="flex items-start justify-center border-b border-zinc-200 pt-0.5 text-center font-bold text-black/80"
                  style={{ height: WEEKLY_TIMELINE_ROW_PX }}
                >
                  {scheduleHourLabel(row)}
                </div>
              ))}
            </div>
          </td>
          {dayIndices.map((di) => {
            const dayDate = addDays(weekMonday, di);
            const dateKey = formatDateKey(dayDate);
            const dayEvents = eventsForDate(dateKey);
            return (
              <td
                key={di}
                className="relative border border-zinc-300 p-0 align-top"
                style={{ height: WEEKLY_TIMELINE_HEIGHT }}
              >
                <WeekDayTimelineColumn
                  date={dayDate}
                  events={dayEvents}
                  onCreateRange={(startMin, endMin) =>
                    onCreateRange(dateKey, startMin, endMin)
                  }
                  onUpdateRange={(id, startMin, endMin) =>
                    onUpdateRange(dateKey, id, startMin, endMin)
                  }
                  onEdit={(id) => onEditEvent(dateKey, id)}
                />
              </td>
            );
          })}
          {showMemo ? (
            <td
              className="relative border border-zinc-300 p-0 align-top"
              style={{ height: WEEKLY_TIMELINE_HEIGHT }}
            >
              <div className="flex h-full flex-col">
                {Array.from({ length: WEEKLY_HOUR_ROW_COUNT }, (_, row) => (
                  <div
                    key={row}
                    className="relative min-h-0 flex-1 border-b border-zinc-200"
                    style={{ height: WEEKLY_TIMELINE_ROW_PX }}
                  >
                    <textarea
                      value={data.memoHours[row] ?? ""}
                      onChange={(e) => patchMemo(row, e.target.value)}
                      className={cellInput}
                    />
                  </div>
                ))}
              </div>
            </td>
          ) : null}
        </tr>
      </tbody>
    </table>
  );
}

export function WeeklyWorksheetView({
  weekKey,
  weekMonday,
}: WeeklyWorksheetViewProps) {
  const {
    getWeeklyWorksheet,
    updateWeeklyWorksheet,
    eventsForDate,
    upsertEvent,
  } = useAppData();
  const data = getWeeklyWorksheet(weekKey, weekMonday);
  const [quickCreate, setQuickCreate] = useState<{
    dateKey: string;
    startMin: number;
    endMin: number;
  } | null>(null);
  const [eventDraft, setEventDraft] = useState<EventDraft | null>(null);

  const patch = useCallback(
    (partial: Partial<WeeklyWorksheet>) => {
      updateWeeklyWorksheet(weekKey, weekMonday, partial);
    },
    [weekKey, weekMonday, updateWeeklyWorksheet],
  );

  const patchDay = useCallback(
    (index: number, partial: Partial<WeeklyWorksheet["days"][number]>) => {
      const days = data.days.map((d, i) =>
        i === index ? { ...d, ...partial } : d,
      );
      patch({ days });
    },
    [data.days, patch],
  );

  const patchMemo = useCallback(
    (rowIndex: number, value: string) => {
      const memoHours = [...data.memoHours];
      memoHours[rowIndex] = value;
      patch({ memoHours });
    },
    [data.memoHours, patch],
  );

  const openEvent = useCallback(
    (draft: Omit<EventDraft, "dateKey"> & { dateKey: string }) => {
      setQuickCreate(null);
      setEventDraft(draft);
    },
    [],
  );

  const onCreateRange = useCallback(
    (dateKey: string, startMin: number, endMin: number) => {
      setQuickCreate({ dateKey, startMin, endMin });
    },
    [],
  );

  const onUpdateEventRange = useCallback(
    (
      dateKey: string,
      id: string,
      startMin: number,
      endMin: number,
    ) => {
      const ev = eventsForDate(dateKey).find((e) => e.id === id);
      if (!ev || ev.kind !== "timed") return;
      upsertEvent({ ...ev, startMin, endMin });
    },
    [eventsForDate, upsertEvent],
  );

  const onEditEvent = useCallback(
    (dateKey: string, id: string) => {
      const ev = eventsForDate(dateKey).find((e) => e.id === id);
      if (ev) openEvent({ dateKey, event: ev });
    },
    [eventsForDate, openEvent],
  );

  const monThu = useMemo(() => [0, 1, 2, 3], []);
  const friSunMemo = useMemo(() => [4, 5, 6], []);

  const gridProps = {
    weekMonday,
    data,
    eventsForDate,
    patchDay,
    patchMemo,
    onCreateRange,
    onUpdateRange: onUpdateEventRange,
    onEditEvent,
  };

  return (
    <div className="space-y-3 text-black">
      <p className="text-xs text-black/50">{WW_SAVE_HINT}</p>
      <p className="text-xs text-black/45">{WW_SCHEDULE_HINT}</p>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="flex min-h-0 flex-col gap-2 lg:h-full">
          <div className={PANEL_TOP_CLASS}>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-base font-bold tracking-tight">{WW_TITLE}</h3>
              <div className="flex flex-wrap items-center gap-1 text-sm">
                <input
                  type="text"
                  value={data.dateRangeStart}
                  onChange={(e) => patch({ dateRangeStart: e.target.value })}
                  placeholder="開始"
                  className="w-20 border-b border-zinc-400 bg-transparent px-1 focus:outline-none"
                />
                <span className="text-black/60">{WW_DATE_RANGE}</span>
                <input
                  type="text"
                  value={data.dateRangeEnd}
                  onChange={(e) => patch({ dateRangeEnd: e.target.value })}
                  placeholder="終了"
                  className="w-20 border-b border-zinc-400 bg-transparent px-1 focus:outline-none"
                />
              </div>
            </div>
            <label className="mt-auto block">
              <span className="mb-1 block text-sm font-bold">
                {WW_TOP_PRIORITY}
              </span>
              <input
                type="text"
                value={data.topPriorityGoal}
                onChange={(e) => patch({ topPriorityGoal: e.target.value })}
                className={headerInput}
              />
            </label>
          </div>
          <div className={GRID_BOX_CLASS}>
            <HourGrid dayIndices={monThu} showMemo={false} {...gridProps} />
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-2 lg:h-full">
          <div className={PANEL_TOP_CLASS}>
            <label className="flex h-full flex-col">
              <span className="mb-1 block text-sm font-bold">
                {WW_WEEKLY_GOALS}
              </span>
              <textarea
                value={data.weeklyGoals}
                onChange={(e) => patch({ weeklyGoals: e.target.value })}
                className={`${headerInput} min-h-0 flex-1 resize-none`}
              />
            </label>
          </div>
          <div className={GRID_BOX_CLASS}>
            <HourGrid dayIndices={friSunMemo} showMemo {...gridProps} />
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-black/70">
          {WW_FOOTER_NOTES}
        </span>
        <textarea
          value={data.footerNotes}
          onChange={(e) => patch({ footerNotes: e.target.value })}
          rows={3}
          className="w-full resize-y rounded border border-dashed border-zinc-300 bg-white px-2 py-1.5 text-sm leading-relaxed text-black placeholder:text-black/30 focus:border-zinc-500 focus:outline-none"
        />
      </label>

      {quickCreate ? (
        <EventQuickCreatePopover
          dateKey={quickCreate.dateKey}
          startMin={quickCreate.startMin}
          endMin={quickCreate.endMin}
          onClose={() => setQuickCreate(null)}
          onMoreDetails={({ title, startMin, endMin }) => {
            openEvent({
              dateKey: quickCreate.dateKey,
              event: null,
              defaultStartMin: startMin,
              defaultEndMin: endMin,
              defaultKind: "timed",
              prefilledTitle: title,
            });
          }}
        />
      ) : null}
      {eventDraft ? (
        <EventModal
          event={eventDraft.event}
          dateKey={eventDraft.dateKey}
          defaultStartMin={eventDraft.defaultStartMin}
          defaultEndMin={eventDraft.defaultEndMin}
          defaultKind={eventDraft.defaultKind}
          prefilledTitle={eventDraft.prefilledTitle}
          onClose={() => setEventDraft(null)}
        />
      ) : null}
    </div>
  );
}
