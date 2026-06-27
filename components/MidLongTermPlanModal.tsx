"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { PlanAchievementGuideView } from "@/components/PlanAchievementGuideView";
import { NorthStarModal } from "@/components/NorthStarModal";
import { useAppData } from "@/components/AppDataProvider";
import {
  PLAN_GUIDE_TITLE,
} from "@/lib/plan-achievement-guide-content";
import {
  applyFamilyMembersToPlan,
  cellLineSpecs,
  formatAgeInCalendarYear,
  isSummaryRow,
  MLTP_COL_LEAD,
  MLTP_COL_SECOND,
  MLTP_COL_YEAR,
  MLTP_LABELS,
  PLAN_FAMILY_MEMBER_MAX,
  PLAN_FAMILY_MEMBER_MIN,
  PLAN_YEAR_COLUMN_COUNT,
  planYearLabels,
  planYearCellToText,
  resizeFamilyMembers,
  resolveBirthYear,
  textToPlanYearCell,
  themeRowIndexFromPlanRow,
  withPlanYearRange,
  type CellColumnKind,
  type MidLongTermPlan,
  type PlanCell,
  type PlanFamilyMember,
} from "@/lib/mid-long-term-plan";

type MidLongTermPlanModalProps = {
  onClose: () => void;
};

const FAMILY_INDEX_MARKS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"] as const;

function MltpAlignedColGroup() {
  return (
    <colgroup>
      <col className={MLTP_COL_LEAD} />
      <col className={MLTP_COL_SECOND} />
      {Array.from({ length: PLAN_YEAR_COLUMN_COUNT }, (_, i) => (
        <col key={i} className={MLTP_COL_YEAR} />
      ))}
    </colgroup>
  );
}

function PlanYearFreeCellEditor({
  cell,
  onChange,
  compact,
  readOnly,
  placeholder = "自由に記入",
}: {
  cell: PlanCell;
  onChange: (cell: PlanCell) => void;
  compact?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const text = planYearCellToText(cell);

  if (readOnly) {
    if (!text.trim()) {
      return (
        <div
          className={`px-1 py-1 text-xs text-black/35 ${compact ? "min-h-[5rem]" : "min-h-[7rem]"}`}
        />
      );
    }
    return (
      <div
        className={`whitespace-pre-wrap px-1.5 py-1 text-xs leading-relaxed text-black/75 ${compact ? "min-h-[5rem]" : "min-h-[7rem]"}`}
      >
        {text}
      </div>
    );
  }

  return (
    <textarea
      value={text}
      onChange={(e) => onChange(textToPlanYearCell(e.target.value))}
      placeholder={placeholder}
      rows={compact ? 4 : 5}
      className={`block w-full resize-y border-0 bg-transparent px-1.5 py-1 text-xs leading-relaxed text-black outline-none placeholder:text-black/35 focus:bg-zinc-50/80 ${compact ? "min-h-[5rem]" : "min-h-[7rem]"}`}
    />
  );
}

function PlanCellEditor({
  lines,
  onChange,
  column,
  summaryRow,
  compact,
  readOnly,
}: {
  lines: PlanCell;
  onChange: (lines: PlanCell) => void;
  column: CellColumnKind;
  summaryRow: boolean;
  compact?: boolean;
  readOnly?: boolean;
}) {
  const specs = cellLineSpecs(column, summaryRow);

  if (readOnly) {
    return (
      <div
        className={`flex h-full flex-col text-xs text-black/75 ${compact ? "min-h-[5rem]" : "min-h-[7rem]"}`}
      >
        {lines.map((line, i) => {
          const spec = specs[i];
          if (!spec || !line.trim()) return null;
          return (
            <div
              key={i}
              className={
                i > 0 ? "border-t border-dotted border-zinc-300 py-0.5" : "py-0.5"
              }
            >
              <span className="mr-1 font-bold text-black/45">{spec.tag}</span>
              {line}
            </div>
          );
        })}
      </div>
    );
  }

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
            <div className="flex min-h-[1.5rem] items-stretch">
              <span
                className="w-5 shrink-0 pt-1 text-center text-[10px] font-bold text-black/50"
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
                className={`min-h-[1.5rem] w-full flex-1 resize-none overflow-hidden border-0 bg-transparent py-0.5 pr-1 text-xs leading-snug text-black outline-none placeholder:text-black/35 focus:bg-zinc-50/80 ${
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
  const [primeSheetOpen, setPrimeSheetOpen] = useState(false);

  useEffect(() => {
    const raw = getMidLongTermPlan();
    const loaded = applyFamilyMembersToPlan(
      raw,
      parseCreatedParts(raw.createdAt).year,
    );
    setPlan(loaded);
    setCreated(parseCreatedParts(loaded.createdAt));
  }, [getMidLongTermPlan]);

  const yearLabels = planYearLabels(plan);
  const referenceYear = created.year;

  const persist = useCallback(
    (next: MidLongTermPlan) => {
      const filled = applyFamilyMembersToPlan(next, referenceYear);
      setPlan(filled);
      setMidLongTermPlan(filled);
    },
    [referenceYear, setMidLongTermPlan],
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
      return { ...row, ...patch };
    });
    persist({ ...plan, rows });
  };

  const updateFamilyMember = (
    index: number,
    patch: Partial<PlanFamilyMember>,
  ) => {
    const familyMembers = plan.familyMembers.map((member, i) => {
      if (i !== index) return member;
      const next = { ...member, ...patch };
      if ("currentAge" in patch) {
        next.birthYear = null;
      }
      return next;
    });
    persist({ ...plan, familyMembers });
  };

  const setFamilyCount = (count: number) => {
    persist({
      ...plan,
      familyMembers: resizeFamilyMembers(plan.familyMembers, count),
    });
  };

  const removeFamilyMember = (index: number) => {
    if (plan.familyMembers.length <= PLAN_FAMILY_MEMBER_MIN) return;
    persist({
      ...plan,
      familyMembers: plan.familyMembers.filter((_, i) => i !== index),
    });
  };

  const recalcOnCreatedChange = (nextCreated: typeof created) => {
    setCreated(nextCreated);
    persist({
      ...plan,
      createdAt: toCreatedIso(nextCreated.year, nextCreated.month, nextCreated.day),
    });
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
    persist(
      withPlanYearRange(plan, Math.round(startYear)),
    );
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
                recalcOnCreatedChange({
                  ...created,
                  year: Number(e.target.value),
                })
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
            className="rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-4 py-3 text-sm font-bold text-amber-950 shadow-md transition-all hover:border-amber-500 hover:shadow-lg"
          >
            {PLAN_GUIDE_TITLE}
          </button>
        </div>

        <p className="text-[11px] text-black/65">{MLTP_LABELS.boxesRelationHint}</p>

        <section className="rounded-lg border border-sky-200 bg-sky-50/40 p-3">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-sm font-bold text-sky-950">
              {MLTP_LABELS.familySectionTitle}
            </h4>
            <span className="text-[11px] text-sky-900/70">
              基準年: {referenceYear}年（作成年）
            </span>
          </div>
          <p className="mb-3 text-xs text-sky-900/75">
            {MLTP_LABELS.familySectionHint}
          </p>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-sky-950">
              {MLTP_LABELS.familyCountLabel}
            </span>
            <button
              type="button"
              onClick={() => setFamilyCount(plan.familyMembers.length - 1)}
              disabled={plan.familyMembers.length <= PLAN_FAMILY_MEMBER_MIN}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-300 bg-white text-lg font-bold text-sky-900 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="人数を減らす"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums">
              {plan.familyMembers.length}
            </span>
            <button
              type="button"
              onClick={() => setFamilyCount(plan.familyMembers.length + 1)}
              disabled={plan.familyMembers.length >= PLAN_FAMILY_MEMBER_MAX}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-300 bg-white text-lg font-bold text-sky-900 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="人数を増やす"
            >
              +
            </button>
            <span className="text-[10px] text-sky-900/60">
              {PLAN_FAMILY_MEMBER_MIN}〜{PLAN_FAMILY_MEMBER_MAX}人
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {plan.familyMembers.map((member, i) => {
              const birthYear = resolveBirthYear(member, referenceYear);
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-sky-200/80 bg-white px-2 py-2"
                >
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-sky-800">
                    {FAMILY_INDEX_MARKS[i] ?? i + 1}
                  </span>
                  <label className="flex min-w-[5rem] flex-1 flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-black/55">
                      {MLTP_LABELS.familyName}
                    </span>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) =>
                        updateFamilyMember(i, { name: e.target.value })
                      }
                      placeholder="例：太郎"
                      className="rounded border border-zinc-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="flex w-24 flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-black/55">
                      {MLTP_LABELS.familyCurrentAge}
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={150}
                        value={member.currentAge ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          updateFamilyMember(i, {
                            currentAge:
                              raw === "" ? null : Number(raw),
                          });
                        }}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-sm text-center"
                      />
                      <span className="text-xs text-black/60">
                        {MLTP_LABELS.familyAgeUnit}
                      </span>
                    </div>
                  </label>
                  <div className="min-w-[4.5rem] text-[11px] text-black/55">
                    {birthYear != null ? (
                      <>
                        {MLTP_LABELS.familyBirthYearAuto}
                        <span className="ml-1 font-semibold text-black/75">
                          {birthYear}
                        </span>
                      </>
                    ) : (
                      <span className="text-black/35">—</span>
                    )}
                  </div>
                  {plan.familyMembers.length > PLAN_FAMILY_MEMBER_MIN ? (
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(i)}
                      className="rounded border border-red-200 px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-50"
                    >
                      {MLTP_LABELS.familyRemoveMember}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

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

        <div className="space-y-4">
          {/* 家族の年齢（サマリー） */}
          <div className="overflow-hidden rounded-lg border border-amber-300">
            <div className="flex items-center gap-2 border-b border-amber-200 bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-2">
              <span className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                年齢
              </span>
              <div>
                <p className="text-xs font-bold text-amber-950">
                  {MLTP_LABELS.tableSectionFamily}
                </p>
                <p className="text-[10px] text-amber-900/70">
                  {MLTP_LABELS.tableSectionFamilyHint}
                </p>
              </div>
            </div>
            <table className="w-full table-fixed border-collapse text-xs">
              <MltpAlignedColGroup />
              <thead>
                <tr className="bg-amber-50/80">
                  <th className="border border-amber-200 px-1 py-1 text-left font-bold">
                    {MLTP_LABELS.colFamilyName}
                  </th>
                  <th className="border border-amber-200 px-1 py-1 text-left font-bold">
                    {MLTP_LABELS.colBirthYear}
                  </th>
                  {yearLabels.map((y) => (
                    <th
                      key={y}
                      className="border border-amber-200 px-0.5 py-1 text-center font-bold"
                    >
                      {y}
                      {MLTP_LABELS.yearRange}
                    </th>
                  ))}
                </tr>
                <tr className="bg-amber-50/40 text-[10px] font-normal text-black/65">
                  <th className="border border-amber-200 px-1 py-0.5 text-left">
                    {MLTP_LABELS.colThemeHintSummary}
                  </th>
                  <th className="border border-amber-200 px-1 py-0.5 text-left">
                    {MLTP_LABELS.colSuccessHintSummary}
                  </th>
                  {yearLabels.map((y) => (
                    <th
                      key={y}
                      className="border border-amber-200 px-0.5 py-0.5 text-center leading-tight"
                    >
                      {MLTP_LABELS.colYearHintSummary}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.familyMembers.map((member, memberIndex) => {
                  const birthYear = resolveBirthYear(member, referenceYear);
                  return (
                    <tr
                      key={memberIndex}
                      className="bg-amber-50/60"
                    >
                      <td className="border border-amber-200 px-2 py-1.5 align-middle font-medium">
                        {member.name.trim() || (
                          <span className="text-black/35">—</span>
                        )}
                      </td>
                      <td className="border border-amber-200 px-2 py-1.5 align-middle text-center tabular-nums">
                        {birthYear ?? (
                          <span className="text-black/35">—</span>
                        )}
                      </td>
                      {yearLabels.map((calendarYear) => (
                        <td
                          key={calendarYear}
                          className="border border-amber-200 px-1 py-1.5 text-center align-middle tabular-nums"
                        >
                          {birthYear != null ? (
                            formatAgeInCalendarYear(birthYear, calendarYear)
                          ) : (
                            <span className="text-black/35">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* テーマ × 年代ごとの計画 */}
          <div className="overflow-hidden rounded-lg border border-violet-300">
            <div className="flex items-start gap-3 border-b border-violet-200 bg-gradient-to-r from-violet-100 via-indigo-50 to-sky-50 px-4 py-3">
              <span className="mt-0.5 shrink-0 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 px-2.5 py-1 text-[11px] font-black tracking-wide text-white shadow-sm">
                テーマ
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-violet-950">
                  {MLTP_LABELS.tableSectionTheme}
                </p>
                <p className="mt-0.5 text-xs font-medium text-violet-900/85">
                  {MLTP_LABELS.tableSectionThemeLead}
                </p>
                <p className="mt-1 text-[10px] text-violet-800/65">
                  {MLTP_LABELS.tableSectionThemeHint}
                </p>
              </div>
            </div>
            <table className="w-full table-fixed border-collapse text-xs">
              <MltpAlignedColGroup />
              <thead>
                <tr className="bg-violet-50/80">
                  <th className="border border-violet-200 px-1 py-1 text-left font-bold text-violet-950">
                    {MLTP_LABELS.colThemeName}
                  </th>
                  <th className="border border-violet-200 px-1 py-1 text-left font-bold">
                    {MLTP_LABELS.colThemeOverview}
                  </th>
                  {yearLabels.map((y) => (
                    <th
                      key={y}
                      className="border border-violet-200 px-0.5 py-1 text-center font-bold"
                    >
                      {y}
                      {MLTP_LABELS.yearRange}
                    </th>
                  ))}
                </tr>
                <tr className="bg-violet-50/40 text-[10px] font-normal text-black/65">
                  <th className="border border-violet-200 px-1 py-0.5" />
                  <th className="border border-violet-200 px-1 py-0.5 text-left">
                    {MLTP_LABELS.colThemeHintTheme}
                  </th>
                  {yearLabels.map((y) => (
                    <th
                      key={y}
                      className="border border-violet-200 px-0.5 py-0.5 text-center leading-tight"
                    >
                      {MLTP_LABELS.colYearHintTheme}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.rows.map((row, rowIndex) => {
                  if (isSummaryRow(rowIndex)) return null;
                  const themeIdx = themeRowIndexFromPlanRow(rowIndex);
                  return (
                    <tr key={rowIndex}>
                      <td className="border border-zinc-300 align-top p-1">
                        <label className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-violet-700/70">
                            {themeIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={plan.themeRowLabels[themeIdx]}
                            onChange={(e) =>
                              updateThemeRowLabel(themeIdx, e.target.value)
                            }
                            className="w-full rounded border border-violet-200 bg-white px-1 py-0.5 text-xs font-semibold"
                          />
                        </label>
                      </td>
                      <td className="border border-zinc-300 align-top p-0">
                        <PlanCellEditor
                          column="theme"
                          summaryRow={false}
                          lines={row.theme}
                          onChange={(theme) => updateRow(rowIndex, { theme })}
                        />
                      </td>
                      {row.years.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className="border border-zinc-300 align-top p-0"
                        >
                          <PlanYearFreeCellEditor
                            cell={cell}
                            onChange={(lines) => {
                              const years = row.years.map((c, j) =>
                                j === colIndex ? lines : c,
                              );
                              updateRow(rowIndex, { years });
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
        <PlanAchievementGuideView
          onOpenPrimeTimeSheet={() => setPrimeSheetOpen(true)}
        />
      </Modal>
    ) : null}

    {primeSheetOpen ? (
      <NorthStarModal
        category="prime"
        onClose={() => setPrimeSheetOpen(false)}
      />
    ) : null}
    </>
  );
}