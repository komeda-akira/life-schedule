"use client";

import { useCallback, useMemo } from "react";
import { useAppData } from "@/components/AppDataProvider";
import { addDays, weekdayTextClass } from "@/lib/calendar";
import type { WeeklyWorksheet } from "@/lib/weekly-worksheet";
import {
  scheduleHourLabel,
  WEEKLY_HOUR_ROW_COUNT,
} from "@/lib/weekly-worksheet";
import {
  WW_COL_DATE,
  WW_COL_MEMO,
  WW_COL_WEEKDAY,
  WW_DATE_RANGE,
  WW_FOOTER_NOTES,
  WW_SAVE_HINT,
  WW_TITLE,
  WW_TOP_PRIORITY,
  WW_WEEKDAYS,
  WW_WEEKLY_GOALS,
} from "@/lib/weekly-worksheet-labels";

const cellInput =
  "h-full w-full resize-none border-0 bg-transparent px-0.5 py-0.5 text-[10px] leading-snug placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded";

const headerInput =
  "w-full border-0 border-b border-dashed border-zinc-400 bg-transparent px-1 py-1 text-xs text-black placeholder:text-black/30 focus:border-zinc-600 focus:outline-none";

/** 左右のグリッド枠を同じ高さにする */
const GRID_BOX_CLASS =
  "flex min-h-[34rem] flex-1 flex-col overflow-x-auto rounded border-2 border-zinc-800 lg:min-h-0";

/** 上段（目標欄）の高さを左右で揃える */
const PANEL_TOP_CLASS = "flex shrink-0 flex-col gap-2 lg:min-h-[8.5rem]";

const HOUR_ROW_CLASS = "h-8";

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
  patchDay,
  patchMemo,
}: {
  dayIndices: number[];
  showMemo: boolean;
  weekMonday: Date;
  data: WeeklyWorksheet;
  patchDay: (index: number, partial: Partial<WeeklyWorksheet["days"][number]>) => void;
  patchMemo: (rowIndex: number, value: string) => void;
}) {
  return (
    <table className="h-full w-full table-fixed border-collapse text-[10px]">
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
          <th className="border border-zinc-800 px-0.5 py-0.5 text-[9px] font-medium text-black">
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
          <th className="border border-zinc-800 px-0.5 py-0.5 text-[9px] font-medium text-black">
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
        {Array.from({ length: WEEKLY_HOUR_ROW_COUNT }, (_, row) => (
          <tr
            key={row}
            className={`${HOUR_ROW_CLASS} ${row % 2 === 1 ? "bg-zinc-50/90" : "bg-white"}`}
          >
            <td className="border border-zinc-300 px-0.5 py-0.5 text-center align-middle font-bold text-black/80">
              {scheduleHourLabel(row)}
            </td>
            {dayIndices.map((di) => (
              <td
                key={di}
                className="relative border border-zinc-300 p-0 align-top"
              >
                <textarea
                  value={data.days[di]?.hours[row] ?? ""}
                  onChange={(e) => {
                    const hours = [...(data.days[di]?.hours ?? [])];
                    hours[row] = e.target.value;
                    patchDay(di, { hours });
                  }}
                  className={cellInput}
                />
                <div
                  className="pointer-events-none absolute right-0 left-0 top-1/2 border-t border-dashed border-zinc-200"
                  aria-hidden
                />
              </td>
            ))}
            {showMemo ? (
              <td className="relative border border-zinc-300 p-0 align-top">
                <textarea
                  value={data.memoHours[row] ?? ""}
                  onChange={(e) => patchMemo(row, e.target.value)}
                  className={cellInput}
                />
                <div
                  className="pointer-events-none absolute right-0 left-0 top-1/2 border-t border-dashed border-zinc-200"
                  aria-hidden
                />
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function WeeklyWorksheetView({
  weekKey,
  weekMonday,
}: WeeklyWorksheetViewProps) {
  const { getWeeklyWorksheet, updateWeeklyWorksheet } = useAppData();
  const data = getWeeklyWorksheet(weekKey, weekMonday);

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

  const monThu = useMemo(() => [0, 1, 2, 3], []);
  const friSunMemo = useMemo(() => [4, 5, 6], []);

  return (
    <div className="space-y-3 text-black">
      <p className="text-[10px] text-black/50">{WW_SAVE_HINT}</p>

      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-stretch">
        <div className="flex min-h-0 flex-col gap-2 lg:h-full">
          <div className={PANEL_TOP_CLASS}>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-sm font-bold tracking-tight">{WW_TITLE}</h3>
              <div className="flex flex-wrap items-center gap-1 text-xs">
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
              <span className="mb-1 block text-xs font-bold">
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
            <HourGrid
              dayIndices={monThu}
              showMemo={false}
              weekMonday={weekMonday}
              data={data}
              patchDay={patchDay}
              patchMemo={patchMemo}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-2 lg:h-full">
          <div className={PANEL_TOP_CLASS}>
            <label className="flex h-full flex-col">
              <span className="mb-1 block text-xs font-bold">
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
            <HourGrid
              dayIndices={friSunMemo}
              showMemo
              weekMonday={weekMonday}
              data={data}
              patchDay={patchDay}
              patchMemo={patchMemo}
            />
          </div>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-black/70">
          {WW_FOOTER_NOTES}
        </span>
        <textarea
          value={data.footerNotes}
          onChange={(e) => patch({ footerNotes: e.target.value })}
          rows={3}
          className="w-full resize-y rounded border border-dashed border-zinc-300 bg-white px-2 py-1.5 text-xs leading-relaxed text-black placeholder:text-black/30 focus:border-zinc-500 focus:outline-none"
        />
      </label>
    </div>
  );
}
