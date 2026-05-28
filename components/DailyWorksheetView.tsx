"use client";

import { useCallback } from "react";
import { useAppData } from "@/components/AppDataProvider";
import type { DailyWorksheet } from "@/lib/daily-worksheet";
import {
  DAILY_MEAL_GROUP_COUNT,
  DAILY_SCHEDULE_END_HOUR,
  DAILY_SCHEDULE_START_HOUR,
  formatDailySheetTitle,
  formatYearRemainingLabel,
} from "@/lib/daily-worksheet";
import {
  DW_COL_CHECK,
  DW_COL_PLAN,
  DW_COL_PRIORITY,
  DW_COL_RESULT,
  DW_COL_SCHEDULE_TIME,
  DW_COL_TIME,
  DW_COL_TODO,
  DW_HEALTH,
  DW_MEAL_EVENING,
  DW_MEAL_FRUIT,
  DW_MEAL_MORNING,
  DW_MEAL_NOON,
  DW_MEAL_PROTEIN,
  DW_MEAL_STAPLE,
  DW_MEAL_VEG,
  DW_MEALS,
  DW_MEMO,
  DW_MONEY,
  DW_MONEY_AMOUNT,
  DW_MONEY_ITEM,
  DW_OWNER_LABEL,
  DW_SAVE_HINT,
  DW_SCHEDULE_TITLE,
  DW_TOP_PRIORITY,
} from "@/lib/daily-worksheet-labels";

const cellInput =
  "w-full border-0 bg-transparent px-1 py-0.5 text-[11px] text-black placeholder:text-black/30 focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded";

const textareaClass =
  "w-full resize-y border-0 bg-transparent px-2 py-1.5 text-[11px] leading-relaxed text-black placeholder:text-black/30 focus:outline-none";

type DailyWorksheetViewProps = {
  dayKey: string;
  date: Date;
};

const MEAL_LABELS = [DW_MEAL_MORNING, DW_MEAL_NOON, DW_MEAL_EVENING];
const MEAL_COL_LABELS = [DW_MEAL_STAPLE, DW_MEAL_VEG, DW_MEAL_PROTEIN, DW_MEAL_FRUIT];

export function DailyWorksheetView({ dayKey, date }: DailyWorksheetViewProps) {
  const { getDailyWorksheet, updateDailyWorksheet } = useAppData();
  const data = getDailyWorksheet(dayKey);

  const patch = useCallback(
    (partial: Partial<DailyWorksheet>) => {
      updateDailyWorksheet(dayKey, partial);
    },
    [dayKey, updateDailyWorksheet],
  );

  const updateTodo = (
    index: number,
    partial: Partial<DailyWorksheet["todos"][number]>,
  ) => {
    const todos = data.todos.map((row, i) =>
      i === index ? { ...row, ...partial } : row,
    );
    patch({ todos });
  };

  const updateMeal = (mealIndex: number, groupIndex: number) => {
    const meals = data.meals.map((row, i) => {
      if (i !== mealIndex) return row;
      const checks = [...row.checks];
      checks[groupIndex] = !checks[groupIndex];
      return { checks };
    });
    patch({ meals });
  };

  const updateMoney = (index: number, partial: Partial<DailyWorksheet["moneyRows"][number]>) => {
    const moneyRows = data.moneyRows.map((row, i) =>
      i === index ? { ...row, ...partial } : row,
    );
    patch({ moneyRows });
  };

  const updateSchedule = (
    index: number,
    partial: Partial<DailyWorksheet["schedule"][number]>,
  ) => {
    const schedule = data.schedule.map((row, i) =>
      i === index ? { ...row, ...partial } : row,
    );
    patch({ schedule });
  };

  const scheduleHours = Array.from(
    { length: DAILY_SCHEDULE_END_HOUR - DAILY_SCHEDULE_START_HOUR + 1 },
    (_, i) => DAILY_SCHEDULE_START_HOUR + i,
  );

  return (
    <div className="flex flex-col gap-4 font-sans text-black">
      <p className="text-[10px] text-black/55">{DW_SAVE_HINT}</p>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-zinc-800 pb-2">
            <h3 className="text-2xl font-black">{formatDailySheetTitle(date)}</h3>
            <span className="text-xs text-black/70">
              {formatYearRemainingLabel(date)}
            </span>
          </div>

          <div className="rounded border-2 border-zinc-800 p-2">
            <p className="mb-1 text-xs font-bold">{DW_TOP_PRIORITY}</p>
            {data.topPriorityGoals.map((text, i) => (
              <input
                key={i}
                type="text"
                value={text}
                onChange={(e) => {
                  const topPriorityGoals = [...data.topPriorityGoals] as [
                    string,
                    string,
                  ];
                  topPriorityGoals[i] = e.target.value;
                  patch({ topPriorityGoals });
                }}
                className={`${cellInput} mb-1 border-b border-dashed border-zinc-400`}
              />
            ))}
          </div>

          <div className="overflow-hidden rounded border-2 border-zinc-800">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-zinc-100">
                  <th className="w-8 border-b border-r border-zinc-800 px-1 py-1 font-bold">
                    {DW_COL_CHECK}
                  </th>
                  <th className="w-10 border-b border-r border-zinc-800 px-1 py-1 font-bold">
                    {DW_COL_PRIORITY}
                  </th>
                  <th className="border-b border-r border-zinc-800 px-1 py-1 text-left font-bold">
                    {DW_COL_TODO}
                  </th>
                  <th className="w-12 border-b border-zinc-800 px-1 py-1 font-bold">
                    {DW_COL_TIME}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.todos.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 1 ? "bg-zinc-50" : "bg-white"}
                  >
                    <td className="border-b border-r border-zinc-300 text-center">
                      <input
                        type="checkbox"
                        checked={row.checked}
                        onChange={(e) =>
                          updateTodo(i, { checked: e.target.checked })
                        }
                        className="h-3.5 w-3.5 accent-zinc-800"
                      />
                    </td>
                    <td className="border-b border-r border-zinc-300 p-0">
                      <input
                        type="text"
                        value={row.priority}
                        onChange={(e) =>
                          updateTodo(i, { priority: e.target.value })
                        }
                        className={cellInput}
                      />
                    </td>
                    <td className="border-b border-r border-zinc-300 p-0">
                      <input
                        type="text"
                        value={row.task}
                        onChange={(e) =>
                          updateTodo(i, { task: e.target.value })
                        }
                        className={cellInput}
                      />
                    </td>
                    <td className="border-b border-zinc-300 p-0">
                      <input
                        type="text"
                        value={row.time}
                        onChange={(e) =>
                          updateTodo(i, { time: e.target.value })
                        }
                        className={cellInput}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded border-2 border-zinc-800 bg-zinc-100">
            <div className="border-b border-zinc-800 px-2 py-1 text-xs font-bold">
              {DW_MEMO}
            </div>
            <textarea
              value={data.memo}
              onChange={(e) => patch({ memo: e.target.value })}
              rows={4}
              className={`${textareaClass} min-h-[5rem]`}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded border-2 border-zinc-800">
              <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold">
                {DW_HEALTH}
              </div>
              <div className="p-2">
                <p className="mb-1 text-[10px] font-bold">{DW_MEALS}</p>
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr>
                      <th className="w-8" />
                      {MEAL_COL_LABELS.map((label) => (
                        <th
                          key={label}
                          className="px-0.5 py-1 text-center font-medium leading-tight"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.meals.map((meal, mealIndex) => (
                      <tr key={mealIndex}>
                        <td className="py-1 pr-1 font-bold">
                          {MEAL_LABELS[mealIndex]}
                        </td>
                        {Array.from({ length: DAILY_MEAL_GROUP_COUNT }, (_, gi) => (
                          <td key={gi} className="text-center">
                            <input
                              type="checkbox"
                              checked={meal.checks[gi] ?? false}
                              onChange={() => updateMeal(mealIndex, gi)}
                              className="h-3.5 w-3.5 rounded-full accent-zinc-800"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded border-2 border-zinc-800">
              <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-xs font-bold">
                {DW_MONEY}
              </div>
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="border-b border-r border-zinc-300 px-1 py-1 text-left font-bold">
                      {DW_MONEY_ITEM}
                    </th>
                    <th className="border-b border-zinc-300 px-1 py-1 text-left font-bold">
                      {DW_MONEY_AMOUNT}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.moneyRows.map((row, i) => (
                    <tr key={i}>
                      <td className="border-b border-r border-zinc-200 p-0">
                        <input
                          type="text"
                          value={row.item}
                          onChange={(e) =>
                            updateMoney(i, { item: e.target.value })
                          }
                          className={cellInput}
                        />
                      </td>
                      <td className="border-b border-zinc-200 p-0">
                        <input
                          type="text"
                          value={row.amount}
                          onChange={(e) =>
                            updateMoney(i, { amount: e.target.value })
                          }
                          className={cellInput}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            value={data.headerQuote}
            onChange={(e) => patch({ headerQuote: e.target.value })}
            rows={2}
            placeholder="ヘッダー引用・メモ"
            className="w-full rounded border border-zinc-300 px-2 py-1 text-[10px] leading-relaxed text-black/80"
          />
          <label className="flex items-center gap-2 text-xs">
            <span className="font-bold">{DW_OWNER_LABEL}</span>
            <input
              type="text"
              value={data.ownerName}
              onChange={(e) => patch({ ownerName: e.target.value })}
              className="flex-1 border-b border-zinc-400 bg-transparent px-1 py-0.5 focus:border-zinc-600 focus:outline-none"
            />
          </label>

          <div className="overflow-hidden rounded border-2 border-zinc-800">
            <div className="border-b border-zinc-800 bg-zinc-100 px-2 py-1 text-center text-sm font-bold">
              {DW_SCHEDULE_TITLE}
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-zinc-50">
                  <th className="border-b border-r border-zinc-800 px-1 py-1 text-left font-bold">
                    {DW_COL_PLAN}
                  </th>
                  <th className="border-b border-r border-zinc-800 px-1 py-1 text-left font-bold">
                    {DW_COL_RESULT}
                  </th>
                  <th className="w-10 border-b border-zinc-800 px-1 py-1 font-bold">
                    {DW_COL_SCHEDULE_TIME}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.schedule.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 1 ? "bg-zinc-50/80" : "bg-white"}
                  >
                    <td className="border-b border-r border-zinc-300 p-0 align-top">
                      <textarea
                        value={row.planned}
                        onChange={(e) =>
                          updateSchedule(i, { planned: e.target.value })
                        }
                        rows={2}
                        className={`${textareaClass} min-h-[2.25rem]`}
                      />
                    </td>
                    <td className="border-b border-r border-zinc-300 p-0 align-top">
                      <textarea
                        value={row.result}
                        onChange={(e) =>
                          updateSchedule(i, { result: e.target.value })
                        }
                        rows={2}
                        className={`${textareaClass} min-h-[2.25rem]`}
                      />
                    </td>
                    <td className="border-b border-zinc-300 px-1 py-1 text-center align-top font-bold text-black/80">
                      {scheduleHours[i]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
