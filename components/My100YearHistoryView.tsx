"use client";

import { useCallback } from "react";
import { useAppData } from "@/components/AppDataProvider";
import type { My100YearHistory } from "@/lib/my-100-year-history";
import {
  MY_100_YEAR_CREATED_LABEL,
  MY_100_YEAR_CURRENT_AGE_LABEL,
  MY_100_YEAR_HISTORY_COLUMNS,
  MY_100_YEAR_HISTORY_LABEL,
  MY_100_YEAR_SAVE_HINT,
} from "@/lib/my-100-year-history";

const dateInputClass =
  "w-12 rounded border border-zinc-300 bg-white px-1 py-0.5 text-center text-xs text-black focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";

const entryInputClass =
  "min-w-0 flex-1 border-0 border-b border-dotted border-zinc-400 bg-transparent px-0.5 py-0.5 text-xs text-black placeholder:text-black/30 focus:border-zinc-600 focus:outline-none";

export function My100YearHistoryView() {
  const { getMy100YearHistory, updateMy100YearHistory } = useAppData();
  const data = getMy100YearHistory();

  const patch = useCallback(
    (partial: Partial<My100YearHistory>) => {
      updateMy100YearHistory(partial);
    },
    [updateMy100YearHistory],
  );

  const setEntry = (age: number, value: string) => {
    const entries = [...data.entries];
    entries[age - 1] = value;
    patch({ entries });
  };

  return (
    <div className="flex flex-col gap-3 font-sans text-black">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-300 pb-3">
        <h3 className="text-xl font-bold tracking-tight">
          {MY_100_YEAR_HISTORY_LABEL}
        </h3>
        <div className="flex flex-wrap items-center gap-1 text-xs text-black/80">
          <span className="shrink-0">{MY_100_YEAR_CREATED_LABEL}</span>
          <input
            type="text"
            inputMode="numeric"
            value={data.createdYear}
            onChange={(e) => patch({ createdYear: e.target.value })}
            placeholder="年"
            aria-label="作成年"
            className={dateInputClass}
          />
          <span>年</span>
          <input
            type="text"
            inputMode="numeric"
            value={data.createdMonth}
            onChange={(e) => patch({ createdMonth: e.target.value })}
            placeholder="月"
            aria-label="作成月"
            className={`${dateInputClass} w-10`}
          />
          <span>月</span>
          <input
            type="text"
            inputMode="numeric"
            value={data.createdDay}
            onChange={(e) => patch({ createdDay: e.target.value })}
            placeholder="日"
            aria-label="作成日"
            className={`${dateInputClass} w-10`}
          />
          <span>日</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-black/70">
        <label className="flex items-center gap-1.5">
          <span>{MY_100_YEAR_CURRENT_AGE_LABEL}</span>
          <input
            type="number"
            min={1}
            max={100}
            value={data.highlightAge}
            onChange={(e) =>
              patch({ highlightAge: Number(e.target.value) || 1 })
            }
            className="w-14 rounded border border-zinc-300 bg-white px-1 py-0.5 text-center"
          />
          <span>歳</span>
        </label>
        <span className="text-black/50">（丸印の年齢）</span>
      </div>

      <p className="text-[11px] text-black/55">{MY_100_YEAR_SAVE_HINT}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MY_100_YEAR_HISTORY_COLUMNS.map(({ start, end }) => (
          <div
            key={start}
            className="overflow-hidden rounded-md border border-zinc-300 bg-white"
          >
            <ul className="divide-y divide-zinc-200">
              {Array.from({ length: end - start + 1 }, (_, i) => {
                const age = start + i;
                const highlighted = age === data.highlightAge;
                const stripe = age % 2 === 0;
                return (
                  <li
                    key={age}
                    className={`flex items-center gap-1 px-1.5 py-0.5 ${
                      stripe ? "bg-zinc-100/90" : "bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-9 shrink-0 items-center justify-center text-xs font-semibold ${
                        highlighted
                          ? "rounded-full border-2 border-black text-black"
                          : "text-black/80"
                      }`}
                    >
                      {age}歳
                    </span>
                    <input
                      type="text"
                      value={data.entries[age - 1] ?? ""}
                      onChange={(e) => setEntry(age, e.target.value)}
                      className={entryInputClass}
                      aria-label={`${age}歳の記録`}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
