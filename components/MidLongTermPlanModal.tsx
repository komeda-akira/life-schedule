"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { PlanAchievementGuideView } from "@/components/PlanAchievementGuideView";
import { useAppData } from "@/components/AppDataProvider";
import {
  PLAN_GUIDE_BUTTON_SUBTITLE,
  PLAN_GUIDE_TITLE,
} from "@/lib/plan-achievement-guide-content";
import {
  cellLineSpecs,
  fillAgesForPlan,
  fillAgesForRow,
  isSummaryRow,
  MLTP_LABELS,
  planYearLabels,
  themeRowIndexFromPlanRow,
  withPlanYearRange,
  type CellColumnKind,
  type MidLongTermPlan,
  type PlanCell,
} from "@/lib/mid-long-term-plan";

type MidLongTermPlanModalProps = {
  onClose: () => void;
};

function PlanCellEditor({
  lines,
  onChange,
  column,
  summaryRow,
  compact,
}: {
  lines: PlanCell;
  onChange: (lines: PlanCell) => void;
  column: CellColumnKind;
  summaryRow: boolean;
  compact?: boolean;
}) {
  const specs = cellLineSpecs(column, summaryRow);

  return (
    <div
      className={`flex h-full flex-col ${compact ? "min-h-[5rem]" : "min-h-[7rem]"}`}
    >
      {lines.map((line, i) => {
        const spec = specs[i];
        if (!spec) return null;
        return (
          <div
            key={i}
            className={
              i > 0 ? "border-t border-dotted border-zinc-400" : undefined
            }
          >
            <div className="flex min-h-[1.35rem] items-stretch">
              <span
                className="w-5 shrink-0 pt-1 text-center text-[9px] font-bold text-black/50"
                title={spec.placeholder}
              >
                {spec.tag}
              </span>
              <textarea
                value={line}
                onChange={(e) => {
                  const next = [...lines] as PlanCell;
                  next[i] = e.target.value;
                  onChange(next);
                }}
                placeholder={spec.placeholder}
                rows={1}
                className={`min-h-[1.35rem] w-full flex-1 resize-none overflow-hidden border-0 bg-transparent py-0.5 pr-1 text-[11px] leading-snug text-black outline-none placeholder:text-black/35 focus:bg-zinc-50/80 ${
                  summaryRow && column === "year" && i === 0
                    ? "font-medium"
                    : ""
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function parseCreatedParts(iso: string): {
  year: number;
  month: number;
  day: number;
} {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

function toCreatedIso(year: number, month: number, day: number): string {
  return new Date(year, month - 1, day).toISOString();
}

export function MidLongTermPlanModal({ onClose }: MidLongTermPlanModalProps) {
  const { getMidLongTermPlan, setMidLongTermPlan } = useAppData();
  const [plan, setPlan] = useState<MidLongTermPlan>(() =>
    getMidLongTermPlan(),
  );
  const [created, setCreated] = useState(() =>
    parseCreatedParts(plan.createdAt),
  );
  const [planGuideOpen, setPlanGuideOpen] = useState(false);

  useEffect(() => {
    const loaded = fillAgesForPlan(getMidLongTermPlan());
    setPlan(loaded);
    setCreated(parseCreatedParts(loaded.createdAt));
  }, [getMidLongTermPlan]);

  const yearLabels = planYearLabels(plan);

  const persist = useCallback(
    (next: MidLongTermPlan) => {
      setPlan(next);
      setMidLongTermPlan(next);
    },
    [setMidLongTermPlan],
  );

  const saveAndClose = () => {
    persist({
      ...plan,
      createdAt: toCreatedIso(created.year, created.month, created.day),
    });
    onClose();
  };

  const updateRow = (
    rowIndex: number,
    patch: Partial<MidLongTermPlan["rows"][number]>,
  ) => {
    const rows = plan.rows.map((row, i) => {
      if (i !== rowIndex) return row;
      const merged = { ...row, ...patch };
      return fillAgesForRow(merged, plan.startYear, plan.endYear);
    });
    persist({ ...plan, rows });
  };

  const updateThemeRowLabel = (themeIndex: number, value: string) => {
    const themeRowLabels = [
      ...plan.themeRowLabels,
    ] as MidLongTermPlan["themeRowLabels"];
    themeRowLabels[themeIndex] = value;
    persist({ ...plan, themeRowLabels });
  };

  const updateGoal = (index: number, value: string) => {
    const goals = [...plan.goals] as MidLongTermPlan["goals"];
    goals[index] = value;
    persist({ ...plan, goals });
  };

  const setStartYear = (startYear: number) => {
    if (!Number.isFinite(startYear)) return;
    persist(fillAgesForPlan(withPlanYearRange(plan, Math.round(startYear))));
  };

  return (
    <>
    <Modal
      title={`${MLTP_LABELS.modalTitle} / ${MLTP_LABELS.modalSubtitle}`}
      onClose={saveAndClose}
      plan
    >
      <div className="flex flex-col gap-3 text-black">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-300 pb-2">
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight">
              {MLTP_LABELS.modalTitle}
            </p>
            <p className="text-xs font-semibold">
              {MLTP_LABELS.modalSubtitle}
              <span className="font-normal text-black/70">／</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
              <input
                type="number"
                value={plan.startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-16 rounded border border-zinc-300 px-1 py-0.5 text-center"
                aria-label={`\u958b\u59cb${MLTP_LABELS.yearRange}`}
              />
              <span>{MLTP_LABELS.yearRange}</span>
              <span className="text-black/60">{MLTP_LABELS.yearRangeSep}</span>
              <span className="font-medium">
                {plan.endYear}
                {MLTP_LABELS.yearRange}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <input
              type="number"
              value={created.year}
              onChange={(e) =>
                setCreated((c) => ({ ...c, year: Number(e.target.value) }))
              }
              className="w-14 rounded border border-zinc-300 px-1 py-0.5 text-center"
              aria-label="\u4f5c\u6210\u5e74"
            />
            <span>{MLTP_LABELS.yearRange}</span>
            <input
              type="number"
              min={1}
              max={12}
              value={created.month}
              onChange={(e) =>
                setCreated((c) => ({ ...c, month: Number(e.target.value) }))
              }
              className="w-10 rounded border border-zinc-300 px-1 py-0.5 text-center"
              aria-label="\u4f5c\u6210\u6708"
            />
            <span>{MLTP_LABELS.monthUnit}</span>
            <input
              type="number"
              min={1}
              max={31}
              value={created.day}
              onChange={(e) =>
                setCreated((c) => ({ ...c, day: Number(e.target.value) }))
              }
              className="w-10 rounded border border-zinc-300 px-1 py-0.5 text-center"
              aria-label="\u4f5c\u6210\u65e5"
            />
            <span>
              {MLTP_LABELS.dayUnit}
              {MLTP_LABELS.createdSuffix}
            </span>
          </div>
        </header>

        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setPlanGuideOpen(true)}
            className="group flex max-w-lg items-center gap-3 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-4 py-3 text-left shadow-md transition-all hover:border-amber-500 hover:shadow-lg"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-sm"
              aria-hidden
            >
              Q2
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-amber-950">
                {PLAN_GUIDE_TITLE}
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-amber-900/80">
                {PLAN_GUIDE_BUTTON_SUBTITLE}
              </span>
              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-amber-900 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  80/20
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-sky-900 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  第2象限
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  書き方
                </span>
              </span>
            </span>
            <span
              className="shrink-0 text-lg text-amber-500 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              ›
            </span>
          </button>
        </div>

        <p className="text-[11px] text-black/65">{MLTP_LABELS.boxesRelationHint}</p>

        <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold">{MLTP_LABELS.priorityGoal}</span>
            <textarea
              value={plan.priorityGoal}
              onChange={(e) =>
                persist({ ...plan, priorityGoal: e.target.value })
              }
              placeholder={MLTP_LABELS.priorityGoalPlaceholder}
              rows={3}
              className="min-h-[4.5rem] resize-none overflow-hidden rounded border border-zinc-400 px-2 py-1.5 text-sm placeholder:text-black/35"
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold">{MLTP_LABELS.goals}</span>
            <p className="text-[10px] text-black/55">{MLTP_LABELS.goalsHint}</p>
            <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-1">
              {plan.goals.map((goal, i) => (
                <label
                  key={i}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <span className="w-4 shrink-0 font-medium">{i + 1}</span>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => updateGoal(i, e.target.value)}
                    placeholder={`\u76ee\u6a19${i + 1}`}
                    className="min-w-0 flex-1 rounded border border-zinc-300 px-1.5 py-1 placeholder:text-black/35"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded border border-zinc-400">
          <table className="w-full table-fixed border-collapse text-[11px]">
            <colgroup>
              <col className="w-[7%]" />
              <col className="w-[5%]" />
              <col className="w-[5%]" />
              {yearLabels.map((y) => (
                <col key={y} className="w-[7.2%]" />
              ))}
              <col className="w-[9%]" />
            </colgroup>
            <thead>
              <tr className="bg-zinc-200">
                <th className="border border-zinc-400 px-1 py-1 text-left font-bold">
                  {MLTP_LABELS.colRow}
                </th>
                <th className="border border-zinc-400 px-1 py-1 text-left font-bold">
                  {MLTP_LABELS.colTheme}
                </th>
                <th className="border border-zinc-400 px-1 py-1 text-left font-bold">
                  {MLTP_LABELS.colSuccess}
                </th>
                {yearLabels.map((y) => (
                  <th
                    key={y}
                    className="border border-zinc-400 px-0.5 py-1 text-center font-bold"
                  >
                    {y}
                    {MLTP_LABELS.yearRange}
                  </th>
                ))}
                <th className="border border-zinc-400 px-1 py-1 text-left font-bold">
                  {MLTP_LABELS.colOutcome}
                </th>
              </tr>
              <tr className="bg-zinc-100 text-[9px] font-normal text-black/70">
                <th className="border border-zinc-400 px-1 py-0.5" />
                <th className="border border-zinc-400 px-1 py-0.5 text-left">
                  {MLTP_LABELS.colThemeHint}
                </th>
                <th className="border border-zinc-400 px-1 py-0.5 text-left">
                  {MLTP_LABELS.colSuccessHint}
                </th>
                {yearLabels.map((y) => (
                  <th
                    key={y}
                    className="border border-zinc-400 px-0.5 py-0.5 text-center leading-tight"
                  >
                    {MLTP_LABELS.colYearAgeHint}
                  </th>
                ))}
                <th className="border border-zinc-400 px-1 py-0.5 text-left">
                  {MLTP_LABELS.colOutcomeHint}
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.rows.map((row, rowIndex) => {
                const summary = isSummaryRow(rowIndex);
                const themeIdx = themeRowIndexFromPlanRow(rowIndex);
                return (
                  <tr
                    key={rowIndex}
                    className={summary ? "bg-amber-50/80" : undefined}
                  >
                    <td className="border border-zinc-400 align-top p-1">
                      {summary ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold leading-tight">
                            {MLTP_LABELS.summaryRowLabel}
                          </span>
                          <span className="rounded bg-amber-200/90 px-1 py-0.5 text-[8px] font-medium leading-tight text-amber-950">
                            {MLTP_LABELS.summaryRowBadge}
                          </span>
                          <span className="mt-1 text-[8px] leading-tight text-black/55">
                            {MLTP_LABELS.colYearSummaryHint}
                          </span>
                        </div>
                      ) : (
                        <label className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold text-black/50">
                            {themeIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={plan.themeRowLabels[themeIdx]}
                            onChange={(e) =>
                              updateThemeRowLabel(themeIdx, e.target.value)
                            }
                            className="w-full rounded border border-zinc-300 bg-white px-1 py-0.5 text-[10px] font-semibold"
                          />
                        </label>
                      )}
                    </td>
                    <td className="border border-zinc-400 align-top p-0">
                      <PlanCellEditor
                        compact={summary}
                        column="theme"
                        summaryRow={summary}
                        lines={row.theme}
                        onChange={(theme) => updateRow(rowIndex, { theme })}
                      />
                    </td>
                    <td className="border border-zinc-400 align-top p-0">
                      <PlanCellEditor
                        compact={summary}
                        column="success"
                        summaryRow={summary}
                        lines={row.successPoint}
                        onChange={(successPoint) =>
                          updateRow(rowIndex, { successPoint })
                        }
                      />
                    </td>
                    {row.years.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className={`border border-zinc-400 align-top p-0 ${
                          summary ? "bg-amber-50/50" : ""
                        }`}
                      >
                        <PlanCellEditor
                          compact={summary}
                          column="year"
                          summaryRow={summary}
                          lines={cell}
                          onChange={(lines) => {
                            const years = row.years.map((c, j) =>
                              j === colIndex ? lines : c,
                            );
                            updateRow(rowIndex, { years });
                          }}
                        />
                      </td>
                    ))}
                    <td className="border border-zinc-400 align-top p-0">
                      <PlanCellEditor
                        compact={summary}
                        column="outcome"
                        summaryRow={summary}
                        lines={row.outcome}
                        onChange={(outcome) => updateRow(rowIndex, { outcome })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-200 pt-2">
          <button
            type="button"
            onClick={saveAndClose}
            className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            {MLTP_LABELS.save}
          </button>
        </div>
      </div>
    </Modal>

    {planGuideOpen ? (
      <Modal
        title={PLAN_GUIDE_TITLE}
        onClose={() => setPlanGuideOpen(false)}
        wide
        plan
      >
        <PlanAchievementGuideView />
      </Modal>
    ) : null}
    </>
  );
}