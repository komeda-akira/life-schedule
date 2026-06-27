"use client";

import {
  PLAN_GUIDE_EXAMPLE_ACTIONS,
  PLAN_GUIDE_EXAMPLE_FIELDS,
  PLAN_GUIDE_EXAMPLE_TITLE,
  PLAN_GUIDE_OPEN_PRIME_SHEET,
  PLAN_GUIDE_MATRIX_AXIS_IMPORTANCE,
  PLAN_GUIDE_MATRIX_AXIS_URGENCY,
  PLAN_GUIDE_MATRIX_IMPORTANT,
  PLAN_GUIDE_MATRIX_NOT_IMPORTANT,
  PLAN_GUIDE_MATRIX_NOT_URGENT,
  PLAN_GUIDE_MATRIX_QUADRANTS,
  PLAN_GUIDE_MATRIX_URGENT,
  PLAN_GUIDE_PARETO_BODY,
  PLAN_GUIDE_PARETO_HEADING,
  PLAN_GUIDE_PARETO_HIGHLIGHT,
  PLAN_GUIDE_PARETO_INPUT_LABEL,
  PLAN_GUIDE_PARETO_LAW,
  PLAN_GUIDE_PARETO_PRIORITY_LABEL,
  PLAN_GUIDE_PARETO_RESULT_HIGHLIGHT,
  PLAN_GUIDE_PARETO_RESULT_LABEL,
  PLAN_GUIDE_PRIME_BODY,
  PLAN_GUIDE_PRIME_DEFINITION,
  PLAN_GUIDE_PRIME_HEADING,
  PLAN_GUIDE_SHEET_INTRO,
  PLAN_GUIDE_SHEET_STEPS,
  PLAN_GUIDE_SHEET_STEPS_TITLE,
  PLAN_GUIDE_SHEET_HEADING,
  PLAN_GUIDE_TITLE,
  type PlanGuideQuadrant,
} from "@/lib/plan-achievement-guide-content";

function ParetoDiagram() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-semibold text-black/65">
          {PLAN_GUIDE_PARETO_INPUT_LABEL}
        </span>
        <div className="flex h-36 w-20 flex-col overflow-hidden rounded border-2 border-zinc-300 bg-white shadow-sm">
          <div className="flex h-[20%] items-center justify-center bg-amber-400 px-1 text-center text-[11px] font-bold leading-tight text-amber-950">
            {PLAN_GUIDE_PARETO_PRIORITY_LABEL}
          </div>
          <div className="flex flex-1 items-center justify-center bg-zinc-100 text-xs text-black/45">
            80％
          </div>
        </div>
      </div>
      <span className="text-2xl text-amber-500" aria-hidden>
        →
      </span>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-semibold text-black/65">
          {PLAN_GUIDE_PARETO_RESULT_LABEL}
        </span>
        <div className="flex h-36 w-20 flex-col overflow-hidden rounded border-2 border-amber-400 bg-white shadow-sm">
          <div className="flex h-[80%] items-center justify-center bg-amber-500 px-1 text-center text-xs font-bold leading-tight text-white">
            {PLAN_GUIDE_PARETO_RESULT_HIGHLIGHT}
          </div>
          <div className="flex h-[20%] items-center justify-center bg-zinc-100 text-xs text-black/45">
            20％
          </div>
        </div>
      </div>
    </div>
  );
}

function QuadrantCell({ quadrant }: { quadrant: PlanGuideQuadrant }) {
  const base =
    "flex min-h-[6.5rem] flex-col rounded-md border p-2.5 text-sm leading-snug";
  const style = quadrant.highlight
    ? `${base} border-2 border-amber-500 bg-amber-50 shadow-sm`
    : `${base} border-zinc-200 bg-white`;

  return (
    <div className={style}>
      <span
        className={`font-bold ${quadrant.highlight ? "text-amber-900" : "text-black/75"}`}
      >
        {quadrant.label}
      </span>
      <ul className="mt-1.5 list-inside list-disc text-black/85">
        {quadrant.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EisenhowerMatrix({ compact }: { compact?: boolean }) {
  const q1 = PLAN_GUIDE_MATRIX_QUADRANTS.find((q) => q.id === "q1")!;
  const q2 = PLAN_GUIDE_MATRIX_QUADRANTS.find((q) => q.id === "q2")!;
  const q3 = PLAN_GUIDE_MATRIX_QUADRANTS.find((q) => q.id === "q3")!;
  const q4 = PLAN_GUIDE_MATRIX_QUADRANTS.find((q) => q.id === "q4")!;

  const axisLabel = compact ? "text-xs" : "text-sm";
  const colLabel = compact ? "text-xs" : "text-sm";

  return (
    <div className={compact ? "text-sm" : "text-base"}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="w-10 shrink-0" />
        <span
          className={`flex-1 text-center font-bold text-black/65 ${axisLabel}`}
        >
          {PLAN_GUIDE_MATRIX_AXIS_URGENCY}
        </span>
      </div>
      <div className="flex gap-1.5">
        <div className="flex w-10 shrink-0 flex-col justify-center">
          <span
            className={`text-center font-bold text-black/65 [writing-mode:vertical-rl] ${axisLabel}`}
            style={{ textOrientation: "mixed" }}
          >
            {PLAN_GUIDE_MATRIX_AXIS_IMPORTANCE}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`mb-1.5 grid grid-cols-2 gap-1 text-center font-semibold text-black/55 ${colLabel}`}
          >
            <span>{PLAN_GUIDE_MATRIX_URGENT}</span>
            <span>{PLAN_GUIDE_MATRIX_NOT_URGENT}</span>
          </div>
          <div
            className={`mb-1.5 text-center font-semibold text-black/55 ${colLabel}`}
          >
            {PLAN_GUIDE_MATRIX_IMPORTANT}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <QuadrantCell quadrant={q1} />
            <QuadrantCell quadrant={q2} />
          </div>
          <div
            className={`my-1.5 text-center font-semibold text-black/55 ${colLabel}`}
          >
            {PLAN_GUIDE_MATRIX_NOT_IMPORTANT}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <QuadrantCell quadrant={q3} />
            <QuadrantCell quadrant={q4} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlanAchievementGuideView({
  onOpenPrimeTimeSheet,
}: {
  onOpenPrimeTimeSheet?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 text-base leading-relaxed text-black">
      <p className="text-center text-xl font-bold">{PLAN_GUIDE_TITLE}</p>

      <section className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
        <h3 className="text-lg font-bold text-amber-950">
          {PLAN_GUIDE_PARETO_HEADING}
        </h3>
        <p className="mt-2 text-base font-semibold text-amber-900">
          {PLAN_GUIDE_PARETO_LAW}
        </p>
        <p className="mt-3 rounded-md bg-amber-500 px-4 py-3 text-center text-base font-bold text-white shadow-sm sm:text-lg">
          {PLAN_GUIDE_PARETO_HIGHLIGHT}
        </p>
        <p className="mt-4 text-base text-black/85">{PLAN_GUIDE_PARETO_BODY}</p>
        <div className="mt-5">
          <ParetoDiagram />
        </div>
      </section>

      <section className="rounded-xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
        <h3 className="text-lg font-bold text-sky-950">
          {PLAN_GUIDE_PRIME_HEADING}
        </h3>
        <p className="mt-2 text-base font-semibold text-sky-900">
          {PLAN_GUIDE_PRIME_DEFINITION}
        </p>
        <div className="mx-auto mt-5 max-w-lg">
          <EisenhowerMatrix />
        </div>
        <p className="mt-5 text-base text-black/85">{PLAN_GUIDE_PRIME_BODY}</p>
      </section>

      <section className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
        <h3 className="text-lg font-bold text-emerald-950">
          {PLAN_GUIDE_SHEET_HEADING}
        </h3>
        <p className="mt-3 text-base text-black/85">{PLAN_GUIDE_SHEET_INTRO}</p>
        <h4 className="mt-5 border-b border-emerald-200 pb-1.5 text-base font-bold text-emerald-900">
          {PLAN_GUIDE_SHEET_STEPS_TITLE}
        </h4>
        <ol className="mt-3 flex flex-col gap-3">
          {PLAN_GUIDE_SHEET_STEPS.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 rounded-lg border border-emerald-100 bg-white/80 p-4"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <span className="text-base text-black/85">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-black">
            {PLAN_GUIDE_EXAMPLE_TITLE}
          </h3>
          {onOpenPrimeTimeSheet ? (
            <button
              type="button"
              onClick={onOpenPrimeTimeSheet}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-base font-bold text-white shadow-md transition-all hover:from-amber-500 hover:to-orange-600 hover:shadow-lg"
            >
              {PLAN_GUIDE_OPEN_PRIME_SHEET}
              <span aria-hidden>→</span>
            </button>
          ) : null}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
            {PLAN_GUIDE_EXAMPLE_FIELDS.map((field) => (
              <div key={field.label}>
                <p className="text-sm font-bold text-black/60">{field.label}</p>
                <p className="mt-1 text-base text-black/85">{field.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-bold text-black/60">
              GAPを埋めるための行動
            </p>
            <ul className="mt-2 list-inside list-disc text-base text-black/85">
              {PLAN_GUIDE_EXAMPLE_ACTIONS.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold text-amber-800">
              重要度・緊急度マトリクス
            </p>
            <EisenhowerMatrix compact />
          </div>
        </div>
      </section>
    </div>
  );
}
