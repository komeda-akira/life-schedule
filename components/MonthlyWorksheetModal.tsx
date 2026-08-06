"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { MonthCalendarGrid } from "@/components/MonthCalendarGrid";
import { MonthlyWorksheetView } from "@/components/MonthlyWorksheetView";
import {
  MW_SAVE_HINT,
  MW_VIEW_CALENDAR,
  MW_VIEW_SHEET,
} from "@/lib/monthly-worksheet-labels";
import { LABEL_NEXT_MONTH, LABEL_PREV_MONTH } from "@/lib/pane-labels";

type MonthlyViewMode = "sheet" | "calendar";

type MonthlyWorksheetModalProps = {
  monthKey: string;
  year: number;
  month: number;
  heading: string;
  onClose: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  /** カレンダーで日付を選んだとき、背面の週・日ペインと連動 */
  onSelectDay?: (date: Date) => void;
  /** 「今日」など、表示月も合わせて移動 */
  onGoToDate?: (date: Date) => void;
};

function ViewToggle({
  view,
  onChange,
}: {
  view: MonthlyViewMode;
  onChange: (v: MonthlyViewMode) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-md border border-zinc-300 bg-zinc-50 p-0.5"
      role="group"
      aria-label="表示切替"
    >
      {(
        [
          ["sheet", MW_VIEW_SHEET],
          ["calendar", MW_VIEW_CALENDAR],
        ] as const
      ).map(([mode, label]) => {
        const active = view === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(mode);
            }}
            aria-pressed={active}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[#1a73e8] text-white shadow-sm"
                : "bg-transparent text-black/70 hover:bg-white hover:text-black"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function MonthlyWorksheetModal({
  monthKey,
  year,
  month,
  heading,
  onClose,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  onGoToDate,
}: MonthlyWorksheetModalProps) {
  const [view, setView] = useState<MonthlyViewMode>("sheet");

  return (
    <Modal
      title={view === "calendar" ? `${year}年 ${month}月` : heading}
      onClose={onClose}
      plan
      onPrev={view === "sheet" ? onPrevMonth : undefined}
      onNext={view === "sheet" ? onNextMonth : undefined}
      prevLabel={LABEL_PREV_MONTH}
      nextLabel={LABEL_NEXT_MONTH}
      headerExtra={<ViewToggle view={view} onChange={setView} />}
    >
      {view === "sheet" ? (
        <>
          <p className="mb-3 text-[11px] text-black/55">{MW_SAVE_HINT}</p>
          <MonthlyWorksheetView
            monthKey={monthKey}
            year={year}
            month={month}
            hideSaveHint
          />
        </>
      ) : (
        <MonthCalendarGrid
          year={year}
          month={month}
          onSelectDay={onSelectDay}
          onGoToDate={onGoToDate}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
        />
      )}
    </Modal>
  );
}
