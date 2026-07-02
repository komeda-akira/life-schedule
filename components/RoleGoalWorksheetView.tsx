"use client";

import { useCallback } from "react";
import { useAppData } from "@/components/AppDataProvider";
import {
  ROLE_FREQUENCY_PRESETS,
  ROLE_GOAL_ADD_ROW,
  ROLE_GOAL_COL_DESCRIPTION,
  ROLE_GOAL_COL_KEY_PEOPLE,
  ROLE_GOAL_COL_ROLE,
  ROLE_GOAL_COL_TIME,
  ROLE_GOAL_EXAMPLE,
  ROLE_GOAL_EXAMPLE_LABEL,
  ROLE_GOAL_FREQUENCY_LABEL,
  ROLE_GOAL_HOURS_PER_DAY_LABEL,
  ROLE_GOAL_HOURS_SUFFIX,
  ROLE_GOAL_INTRO,
  ROLE_GOAL_MODAL_TITLE,
  ROLE_GOAL_PHASE_DAYS_PER_YEAR_LABEL,
  ROLE_GOAL_PLAN_EMPTY,
  ROLE_GOAL_PLAN_EQUIVALENT,
  ROLE_GOAL_PLAN_MONTHLY,
  ROLE_GOAL_PLAN_REMAINING,
  ROLE_GOAL_PLAN_ROLE_DAYS,
  ROLE_GOAL_PLAN_ROLE_HOURS,
  ROLE_GOAL_PLAN_SUMMARY_TITLE,
  ROLE_GOAL_PLAN_TIMELINE,
  ROLE_GOAL_ROW_PREFIX,
  ROLE_GOAL_STEP_LABEL,
  ROLE_GOAL_THINKING_BODY,
  ROLE_GOAL_THINKING_TITLE,
  ROLE_GOAL_TIME_GUIDE_ITEMS,
  ROLE_GOAL_TIME_GUIDE_TITLE,
  ROLE_GOAL_YEARS_LABEL,
  ROLE_GOAL_YEARS_SUFFIX,
  type RoleFrequencyPresetId,
} from "@/lib/role-goal-worksheet-content";
import {
  applyFrequencyPreset,
  computeRoleTimeStats,
  createEmptyRoleGoalPhase,
  createEmptyRoleGoalRow,
  formatEquivalentYears,
  formatHours,
  type RoleGoalPhase,
  type RoleGoalRow,
  type RoleTimeStats,
} from "@/lib/role-goal-worksheet";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black placeholder:text-black/35 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";

const textareaClass = `${inputClass} min-h-[4.5rem] resize-y leading-relaxed`;

const TIMELINE_COLORS = [
  "bg-sky-500",
  "bg-indigo-400",
  "bg-teal-400",
  "bg-amber-400",
  "bg-violet-400",
];

function PlanSummary({ stats }: { stats: RoleTimeStats }) {
  if (!stats.hasData) {
    return (
      <div className="rounded-lg border border-dashed border-sky-200 bg-sky-50/40 px-3 py-4 text-center text-[11px] leading-relaxed text-black/55">
        {ROLE_GOAL_PLAN_EMPTY}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-sky-300 bg-gradient-to-br from-sky-50 to-indigo-50/80 p-3">
      <p className="text-xs font-bold text-sky-950">{ROLE_GOAL_PLAN_SUMMARY_TITLE}</p>

      <div className="mt-2">
        <p className="mb-1 text-[10px] font-semibold text-black/55">
          {ROLE_GOAL_PLAN_TIMELINE}
        </p>
        <div className="flex h-3 overflow-hidden rounded-full bg-white/80 ring-1 ring-sky-200">
          {stats.phases.map((phase, index) => (
            <div
              key={index}
              className={`${TIMELINE_COLORS[index % TIMELINE_COLORS.length]} min-w-[2px]`}
              style={{ flex: phase.shareOfSpan }}
              title={phase.label || `期間${index + 1}`}
            />
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {stats.phases.map((phase, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 text-[10px] text-black/65"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${TIMELINE_COLORS[index % TIMELINE_COLORS.length]}`}
              />
              {phase.label || `期間${index + 1}`}（{phase.years}年）
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MetricCard
          label={ROLE_GOAL_PLAN_REMAINING}
          value={`${stats.totalSpanYears.toLocaleString("ja-JP")}年`}
        />
        <MetricCard
          label={ROLE_GOAL_PLAN_ROLE_DAYS}
          value={`${stats.totalDays.toLocaleString("ja-JP")}日`}
        />
        <MetricCard
          label={ROLE_GOAL_PLAN_ROLE_HOURS}
          value={formatHours(stats.totalHours)}
          highlight
        />
        <MetricCard
          label={ROLE_GOAL_PLAN_MONTHLY}
          value={
            stats.avgHoursPerMonth > 0
              ? `約${Math.round(stats.avgHoursPerMonth).toLocaleString("ja-JP")}時間`
              : "—"
          }
        />
      </div>

      <p className="mt-2 rounded-md bg-white/70 px-2 py-1.5 text-[10px] leading-relaxed text-black/70">
        {ROLE_GOAL_PLAN_EQUIVALENT}：{formatEquivalentYears(stats.equivalentYears)}
        {stats.avgHoursPerDay > 0
          ? ` · 関わる日は平均 ${stats.avgHoursPerDay.toFixed(1)}時間/日`
          : ""}
      </p>

      <div className="mt-2 space-y-1 border-t border-sky-200/80 pt-2 text-[10px] leading-relaxed text-sky-950">
        {stats.phases.map((phase, index) => (
          <p key={index}>
            {phase.line}
            {phase.totalHours > 0 ? ` · ${phase.detailLine}` : ""}
          </p>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-2 py-1.5 ${
        highlight
          ? "border-sky-400 bg-white shadow-sm"
          : "border-sky-200/80 bg-white/60"
      }`}
    >
      <p className="text-[10px] font-medium text-black/55">{label}</p>
      <p
        className={`mt-0.5 text-sm font-bold ${highlight ? "text-sky-900" : "text-black/85"}`}
      >
        {value}
      </p>
    </div>
  );
}

function CompactPlanSummary({ stats }: { stats: RoleTimeStats }) {
  if (!stats.hasData) return null;

  return (
    <div className="space-y-1 text-[11px] leading-relaxed text-black/85">
      {stats.phases.map((phase, index) => (
        <p key={index}>
          {phase.line}
          {phase.totalHours > 0 ? ` · ${phase.detailLine}` : ""}
        </p>
      ))}
      <p className="font-semibold text-sky-950">
        {formatHours(stats.totalHours)} / {stats.totalSpanYears}年
        {stats.avgHoursPerMonth > 0
          ? ` · 月約${Math.round(stats.avgHoursPerMonth)}時間`
          : ""}
      </p>
    </div>
  );
}

function PhaseEditor({
  phase,
  onChange,
}: {
  phase: RoleGoalPhase;
  onChange: (partial: Partial<RoleGoalPhase>) => void;
}) {
  const stats = computeRoleTimeStats([phase]);
  const phaseResult = stats.phases[0];
  const isCustom = phase.frequencyPreset === "custom";

  const selectPreset = (presetId: RoleFrequencyPresetId) => {
    onChange(applyFrequencyPreset(phase, presetId));
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm">
      <div className="flex flex-col gap-2.5">
        <input
          type="text"
          value={phase.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className={inputClass}
          placeholder="高校卒業まで"
        />

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-black/65">
            {ROLE_GOAL_YEARS_LABEL}
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={phase.years}
              onChange={(e) => onChange({ years: e.target.value })}
              className={`${inputClass} max-w-[5rem] text-center text-base font-semibold`}
              placeholder="5"
            />
            <span className="text-sm font-medium text-black/70">
              {ROLE_GOAL_YEARS_SUFFIX}
            </span>
          </div>
        </label>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold text-black/65">
            {ROLE_GOAL_FREQUENCY_LABEL}
          </p>
          <div className="flex flex-wrap gap-1">
            {ROLE_FREQUENCY_PRESETS.map((preset) => {
              const active = phase.frequencyPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.id)}
                  className={`rounded-full border px-2 py-1 text-[10px] font-semibold transition-colors ${
                    active
                      ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                      : "border-zinc-200 bg-zinc-50 text-black/70 hover:border-sky-300 hover:bg-sky-50"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          {phase.frequencyPreset && phase.frequencyPreset !== "custom" ? (
            <p className="mt-1 text-[10px] text-sky-800">
              →{" "}
              {
                ROLE_FREQUENCY_PRESETS.find((p) => p.id === phase.frequencyPreset)
                  ?.hint
              }
            </p>
          ) : null}
        </div>

        {isCustom ? (
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-black/65">
              {ROLE_GOAL_PHASE_DAYS_PER_YEAR_LABEL}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={phase.daysPerYear}
              onChange={(e) =>
                onChange({ daysPerYear: e.target.value, frequencyPreset: "custom" })
              }
              className={inputClass}
              placeholder="365"
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-black/65">
            {ROLE_GOAL_HOURS_PER_DAY_LABEL}
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              inputMode="decimal"
              value={phase.hoursPerDay}
              onChange={(e) => onChange({ hoursPerDay: e.target.value })}
              className={`${inputClass} max-w-[5rem] text-center`}
              placeholder="8"
            />
            <span className="text-[11px] text-black/60">{ROLE_GOAL_HOURS_SUFFIX}</span>
          </div>
        </label>

        {phaseResult ? (
          <p className="rounded-md bg-sky-50 px-2 py-1.5 text-[10px] font-medium leading-relaxed text-sky-950">
            この期間：{phaseResult.line}
            {phaseResult.totalHours > 0 ? ` · ${phaseResult.detailLine}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function RoleTimePlanner({
  phases,
  onChangePhases,
}: {
  phases: RoleGoalPhase[];
  onChangePhases: (phases: RoleGoalPhase[]) => void;
}) {
  const phase = phases[0] ?? createEmptyRoleGoalPhase();
  const stats = computeRoleTimeStats([phase]);

  const updatePhase = (partial: Partial<RoleGoalPhase>) => {
    onChangePhases([{ ...phase, ...partial }]);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <PhaseEditor phase={phase} onChange={updatePhase} />
      <PlanSummary stats={stats} />
    </div>
  );
}

function ExampleRow() {
  const examplePhases = ROLE_GOAL_EXAMPLE.phases.map((phase) => ({ ...phase }));
  const stats = computeRoleTimeStats(examplePhases);

  return (
    <tr className="bg-sky-50/60">
      <th className="border-b border-r border-zinc-300 px-2 py-2 align-top text-left text-[11px] font-bold text-sky-900">
        {ROLE_GOAL_EXAMPLE_LABEL}
      </th>
      <td className="border-b border-r border-zinc-300 px-2 py-2 align-top text-sm text-black/85">
        {ROLE_GOAL_EXAMPLE.role}
      </td>
      <td className="border-b border-r border-zinc-300 px-2 py-2 align-top text-sm text-black/85">
        {ROLE_GOAL_EXAMPLE.keyPeople}
      </td>
      <td className="border-b border-r border-zinc-300 px-2 py-2 align-top">
        <CompactPlanSummary stats={stats} />
      </td>
      <td className="border-b border-zinc-300 px-2 py-2 align-top text-sm leading-relaxed text-black/85">
        {ROLE_GOAL_EXAMPLE.description}
      </td>
    </tr>
  );
}

function EditableRow({
  index,
  row,
  onChange,
}: {
  index: number;
  row: RoleGoalRow;
  onChange: (next: RoleGoalRow) => void;
}) {
  return (
    <tr className="bg-white">
      <th className="border-b border-r border-zinc-300 px-2 py-2 align-top text-left text-[11px] font-bold text-black/80">
        {ROLE_GOAL_ROW_PREFIX}
        {String.fromCharCode(0x2460 + index)}
      </th>
      <td className="border-b border-r border-zinc-300 p-1 align-top">
        <input
          type="text"
          value={row.role}
          onChange={(e) => onChange({ ...row, role: e.target.value })}
          className={inputClass}
          placeholder="親、配偶者…"
          aria-label={`${ROLE_GOAL_ROW_PREFIX}${index + 1} ${ROLE_GOAL_COL_ROLE}`}
        />
      </td>
      <td className="border-b border-r border-zinc-300 p-1 align-top">
        <input
          type="text"
          value={row.keyPeople}
          onChange={(e) => onChange({ ...row, keyPeople: e.target.value })}
          className={inputClass}
          aria-label={`${ROLE_GOAL_ROW_PREFIX}${index + 1} ${ROLE_GOAL_COL_KEY_PEOPLE}`}
        />
      </td>
      <td className="border-b border-r border-zinc-300 p-1.5 align-top">
        <RoleTimePlanner
          phases={row.phases}
          onChangePhases={(phases) => onChange({ ...row, phases })}
        />
      </td>
      <td className="border-b border-zinc-300 p-1 align-top">
        <textarea
          value={row.description}
          onChange={(e) => onChange({ ...row, description: e.target.value })}
          rows={4}
          className={textareaClass}
          aria-label={`${ROLE_GOAL_ROW_PREFIX}${index + 1} ${ROLE_GOAL_COL_DESCRIPTION}`}
        />
      </td>
    </tr>
  );
}

export function RoleGoalWorksheetView() {
  const { getGoalSetting, updateGoalSetting } = useAppData();
  const data = getGoalSetting();
  const rows = data.roleGoals;

  const updateRows = useCallback(
    (nextRows: RoleGoalRow[]) => {
      updateGoalSetting({ roleGoals: nextRows });
    },
    [updateGoalSetting],
  );

  const updateRow = (index: number, next: RoleGoalRow) => {
    updateRows(rows.map((row, i) => (i === index ? next : row)));
  };

  const addRow = () => {
    updateRows([...rows, createEmptyRoleGoalRow()]);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 font-sans text-black">
      <header className="text-center">
        <p className="text-xs font-bold tracking-wide text-sky-700">
          {ROLE_GOAL_STEP_LABEL}
        </p>
        <h3 className="mt-1 text-lg font-bold tracking-tight">
          {ROLE_GOAL_MODAL_TITLE}
        </h3>
      </header>

      <p className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 text-sm leading-relaxed text-black/90">
        {ROLE_GOAL_INTRO}
      </p>

      <section className="rounded-lg border border-sky-200 bg-sky-50/50 p-4">
        <h4 className="text-sm font-bold text-sky-950">
          {ROLE_GOAL_THINKING_TITLE}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-black/85">
          {ROLE_GOAL_THINKING_BODY}
        </p>
        <div className="mt-3 rounded-md border border-sky-300 bg-white/80 p-3">
          <p className="text-xs font-bold text-sky-900">
            {ROLE_GOAL_TIME_GUIDE_TITLE}
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-relaxed text-black/85">
            {ROLE_GOAL_TIME_GUIDE_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      <div className="overflow-x-auto rounded-lg border border-zinc-300">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead>
            <tr className="bg-zinc-100 text-left text-[11px] font-semibold text-black/85">
              <th className="w-[4.5rem] border-b border-r border-zinc-300 px-2 py-2" />
              <th className="w-[5.5rem] border-b border-r border-zinc-300 px-2 py-2">
                {ROLE_GOAL_COL_ROLE}
              </th>
              <th className="w-[6rem] border-b border-r border-zinc-300 px-2 py-2">
                {ROLE_GOAL_COL_KEY_PEOPLE}
              </th>
              <th className="w-[18rem] border-b border-r border-zinc-300 px-2 py-2">
                {ROLE_GOAL_COL_TIME}
              </th>
              <th className="border-b border-zinc-300 px-2 py-2">
                {ROLE_GOAL_COL_DESCRIPTION}
              </th>
            </tr>
          </thead>
          <tbody>
            <ExampleRow />
            {rows.map((row, index) => (
              <EditableRow
                key={index}
                index={index}
                row={row}
                onChange={(next) => updateRow(index, next)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-dashed border-zinc-400 px-4 py-2 text-sm font-semibold text-black/75 transition-colors hover:border-zinc-500 hover:bg-zinc-50"
        >
          + {ROLE_GOAL_ADD_ROW}
        </button>
      </div>
    </div>
  );
}
