"use client";

import { useCallback } from "react";
import { AutoGrowTextarea } from "@/components/AutoGrowTextarea";
import { useAppData } from "@/components/AppDataProvider";
import type { MonthlyWorksheet } from "@/lib/monthly-worksheet";
import { MONTHLY_DAY_COLUMNS } from "@/lib/monthly-worksheet";
import {
  MW_ACTION_TITLE,
  MW_COL_GOALS,
  MW_COL_NO,
  MW_COL_OUTCOME,
  MW_COL_STATUS,
  MW_COL_SUCCESS,
  MW_COL_THEME,
  MW_CREATED_LABEL,
  MW_IMPROVEMENT,
  MW_MONTHLY_GOALS,
  MW_NEXT_PLAN,
  MW_POOR_MINDSET,
  MW_REFLECTION_TITLE,
  MW_SAVE_HINT,
  MW_TOP_PRIORITY,
  MW_WENT_POORLY,
  MW_WENT_WELL,
} from "@/lib/monthly-worksheet-labels";

const inputClass =
  "w-full border-0 bg-transparent px-1.5 py-1 text-xs text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded";

const textareaClass =
  "w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs leading-relaxed text-black placeholder:text-black/30 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";

const REFLECTION_MIN_HEIGHT = 128;
const sectionTitleClass =
  "border-b border-zinc-800 pb-1 text-sm font-bold tracking-tight text-black";

type MonthlyWorksheetViewProps = {
  monthKey: string;
  year: number;
  month: number;
};

export function MonthlyWorksheetView({
  monthKey,
  year,
  month,
}: MonthlyWorksheetViewProps) {
  const { getMonthlyWorksheet, updateMonthlyWorksheet } = useAppData();
  const data = getMonthlyWorksheet(monthKey, year, month);

  const patch = useCallback(
    (partial: Partial<MonthlyWorksheet>) => {
      updateMonthlyWorksheet(monthKey, year, month, partial);
    },
    [monthKey, year, month, updateMonthlyWorksheet],
  );

  const updateGoalRow = (
    index: number,
    field: "goal" | "status",
    value: string,
  ) => {
    const reflectionGoals = data.reflectionGoals.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    patch({ reflectionGoals });
  };

  const updateMonthlyGoal = (index: number, value: string) => {
    const monthlyGoals = [...data.monthlyGoals];
    monthlyGoals[index] = value;
    patch({ monthlyGoals });
  };

  const updateActionRow = (
    index: number,
    partial: Partial<MonthlyWorksheet["actionRows"][number]>,
  ) => {
    const actionRows = data.actionRows.map((row, i) =>
      i === index ? { ...row, ...partial } : row,
    );
    patch({ actionRows });
  };

  const toggleDayCheck = (rowIndex: number, dayIndex: number) => {
    const actionRows = data.actionRows.map((row, i) => {
      if (i !== rowIndex) return row;
      const dayChecks = [...row.dayChecks];
      dayChecks[dayIndex] = !dayChecks[dayIndex];
      return { ...row, dayChecks };
    });
    patch({ actionRows });
  };

  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div className="flex flex-col gap-8 font-sans text-black">
      <p className="text-[11px] text-black/55">{MW_SAVE_HINT}</p>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-zinc-800 pb-2">
          <h3 className="text-base font-bold">{MW_REFLECTION_TITLE}</h3>
          <label className="flex items-center gap-1 text-xs text-black/70">
            <span>{year}年</span>
            <span className="font-semibold">{month}月</span>
            <span className="mx-1">/</span>
            <span>{MW_CREATED_LABEL}</span>
            <input
              type="text"
              value={data.createdDate}
              onChange={(e) => patch({ createdDate: e.target.value })}
              className="max-w-[8rem] border-b border-zinc-400 bg-transparent px-1 text-xs focus:border-zinc-600 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded border-2 border-zinc-800">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100">
                    <th className="border-b border-r border-zinc-800 px-1 py-1 text-left font-bold">
                      {MW_COL_GOALS}
                    </th>
                    <th className="border-b border-zinc-800 px-1 py-1 text-left font-bold">
                      {MW_COL_STATUS}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.reflectionGoals.map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 1 ? "bg-zinc-50" : "bg-white"}
                    >
                      <td className="border-b border-r border-zinc-300 p-0">
                        <input
                          type="text"
                          value={row.goal}
                          onChange={(e) =>
                            updateGoalRow(i, "goal", e.target.value)
                          }
                          className={inputClass}
                          aria-label={`${MW_COL_GOALS} ${i + 1}`}
                        />
                      </td>
                      <td className="border-b border-zinc-300 p-0">
                        <input
                          type="text"
                          value={row.status}
                          onChange={(e) =>
                            updateGoalRow(i, "status", e.target.value)
                          }
                          className={inputClass}
                          aria-label={`${MW_COL_STATUS} ${i + 1}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-1 flex-col rounded border-2 border-zinc-800">
              <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold">
                {MW_WENT_WELL}
              </div>
              <AutoGrowTextarea
                value={data.wentWell}
                onChange={(e) => patch({ wentWell: e.target.value })}
                minHeightPx={REFLECTION_MIN_HEIGHT}
                className={`${textareaClass} border-0 rounded-none`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col rounded border-2 border-zinc-800">
              <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold">
                {MW_WENT_POORLY}
              </div>
              <AutoGrowTextarea
                value={data.wentPoorly}
                onChange={(e) => patch({ wentPoorly: e.target.value })}
                minHeightPx={REFLECTION_MIN_HEIGHT}
                className={`${textareaClass} border-0 rounded-none`}
              />
            </div>
            <div className="flex flex-col rounded border-2 border-zinc-800">
              <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold leading-snug">
                {MW_POOR_MINDSET}
              </div>
              <AutoGrowTextarea
                value={data.poorMindset}
                onChange={(e) => patch({ poorMindset: e.target.value })}
                minHeightPx={REFLECTION_MIN_HEIGHT}
                className={`${textareaClass} border-0 rounded-none`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col rounded border-2 border-zinc-800">
              <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold leading-snug">
                {MW_IMPROVEMENT}
              </div>
              <AutoGrowTextarea
                value={data.improvement}
                onChange={(e) => patch({ improvement: e.target.value })}
                minHeightPx={REFLECTION_MIN_HEIGHT}
                className={`${textareaClass} border-0 rounded-none`}
              />
            </div>
            <div className="flex justify-center text-zinc-500" aria-hidden>
              <span className="text-lg leading-none">»</span>
              <span className="text-lg leading-none">»</span>
            </div>
            <div className="flex flex-col rounded border-2 border-zinc-800">
              <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold leading-snug">
                {MW_NEXT_PLAN}
              </div>
              <AutoGrowTextarea
                value={data.nextMonthPlan}
                onChange={(e) => patch({ nextMonthPlan: e.target.value })}
                minHeightPx={REFLECTION_MIN_HEIGHT}
                className={`${textareaClass} border-0 rounded-none`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-zinc-800 pb-2">
          <h3 className="text-base font-bold">{MW_ACTION_TITLE}</h3>
          <span className="text-xs text-black/70">
            {year}年 {month}月
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col rounded border-2 border-zinc-800">
            <span className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold">
              {MW_TOP_PRIORITY}
            </span>
            <AutoGrowTextarea
              value={data.topPriorityGoal}
              onChange={(e) => patch({ topPriorityGoal: e.target.value })}
              minHeightPx={72}
              className={`${textareaClass} border-0 rounded-none`}
            />
          </label>
          <div className="rounded border-2 border-zinc-800">
            <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold">
              {MW_MONTHLY_GOALS}
            </div>
            <ol className="divide-y divide-zinc-200">
              {data.monthlyGoals.map((text, i) => (
                <li key={i} className="flex gap-2 px-2 py-0.5">
                  <span className="w-4 shrink-0 pt-1 text-xs font-bold text-black/70">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => updateMonthlyGoal(i, e.target.value)}
                    className={`${inputClass} border-b border-dotted border-zinc-300`}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="overflow-x-auto rounded border-2 border-zinc-800">
          <table className="min-w-[900px] w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-zinc-100">
                <th className="sticky left-0 z-10 w-8 border-b border-r border-zinc-800 bg-zinc-100 px-1 py-1 font-bold">
                  {MW_COL_NO}
                </th>
                <th className="min-w-[7rem] border-b border-r border-zinc-800 px-1 py-1 text-left font-bold">
                  {MW_COL_THEME}
                </th>
                <th className="min-w-[5rem] border-b border-r border-zinc-800 px-1 py-1 text-left font-bold">
                  {MW_COL_SUCCESS}
                </th>
                {Array.from({ length: MONTHLY_DAY_COLUMNS }, (_, d) => (
                  <th
                    key={d}
                    className={`w-6 border-b border-r border-zinc-800 px-0 py-1 text-center font-bold ${
                      d + 1 > daysInMonth ? "text-black/25" : ""
                    }`}
                  >
                    {d + 1}
                  </th>
                ))}
                <th className="min-w-[5rem] border-b border-zinc-800 px-1 py-1 text-left font-bold">
                  {MW_COL_OUTCOME}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.actionRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 1 ? "bg-zinc-50/80" : "bg-white"}
                >
                  <td className="sticky left-0 z-10 border-b border-r border-zinc-300 bg-inherit px-1 py-0.5 text-center font-medium text-black/70">
                    {rowIndex + 1}
                  </td>
                  <td className="border-b border-r border-zinc-300 p-0">
                    <input
                      type="text"
                      value={row.theme}
                      onChange={(e) =>
                        updateActionRow(rowIndex, { theme: e.target.value })
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="border-b border-r border-zinc-300 p-0">
                    <input
                      type="text"
                      value={row.successPoint}
                      onChange={(e) =>
                        updateActionRow(rowIndex, {
                          successPoint: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </td>
                  {Array.from({ length: MONTHLY_DAY_COLUMNS }, (_, dayIndex) => {
                    const disabled = dayIndex + 1 > daysInMonth;
                    return (
                      <td
                        key={dayIndex}
                        className={`border-b border-r border-zinc-300 p-0 text-center ${
                          disabled ? "bg-zinc-100/80" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={row.dayChecks[dayIndex] ?? false}
                          disabled={disabled}
                          onChange={() => toggleDayCheck(rowIndex, dayIndex)}
                          className="h-3 w-3 accent-zinc-800"
                          aria-label={`${rowIndex + 1}\u884c ${dayIndex + 1}\u65e5`}
                        />
                      </td>
                    );
                  })}
                  <td className="border-b border-zinc-300 p-0">
                    <input
                      type="text"
                      value={row.outcomeImage}
                      onChange={(e) =>
                        updateActionRow(rowIndex, {
                          outcomeImage: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
