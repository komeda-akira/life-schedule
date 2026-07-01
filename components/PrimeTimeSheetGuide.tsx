"use client";

import {
  PLAN_GUIDE_EXAMPLE_ACTIONS,
  PLAN_GUIDE_EXAMPLE_FIELDS,
  PLAN_GUIDE_EXAMPLE_TITLE,
  PLAN_GUIDE_MATRIX_AXIS_IMPORTANCE,
  PLAN_GUIDE_MATRIX_AXIS_URGENCY,
  PLAN_GUIDE_MATRIX_IMPORTANT,
  PLAN_GUIDE_MATRIX_NOT_IMPORTANT,
  PLAN_GUIDE_MATRIX_NOT_URGENT,
  PLAN_GUIDE_MATRIX_QUADRANTS,
  PLAN_GUIDE_MATRIX_URGENT,
  PLAN_GUIDE_PRIME_SHEET_INTRO,
  PLAN_GUIDE_SCHEDULE_NOTE,
  PLAN_GUIDE_SHEET_STEPS,
  PLAN_GUIDE_SHEET_STEPS_TITLE,
  PLAN_GUIDE_STEP_LABEL,
  PLAN_GUIDE_TOGGLE_SUMMARY,
  type PlanGuideQuadrant,
} from "@/lib/plan-achievement-guide-content";
import {
  PTS_S1,
  PTS_S2,
  PTS_S3,
  PTS_S4,
  PTS_S5,
  PTS_S6,
} from "@/lib/prime-time-sheet-labels";

const SHEET_FIELD_HINTS = [PTS_S1, PTS_S2, PTS_S3, PTS_S4, PTS_S5, PTS_S6];

function QuadrantCell({ quadrant }: { quadrant: PlanGuideQuadrant }) {
  const base =
    "flex min-h-[5.5rem] flex-col rounded-md border p-2 text-[10px] leading-snug";
  const style = quadrant.highlight
    ? `${base} border-2 border-amber-500 bg-amber-50 shadow-sm`
    : `${base} border-zinc-200 bg-white`;

  return (
    <div className={style}>
      <span
        className={`font-bold ${quadrant.highlight ? "text-amber-900" : "text-black/75"}`}
      >
        {quadrant.label}
        {quadrant.highlight ? (
          <span className="ml-0.5 text-amber-600" aria-hidden>
            ★
          </span>
        ) : null}
      </span>
      <ul className="mt-1 list-inside list-disc text-black/85">
        {quadrant.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ExampleMatrix() {
  const q1 = PLAN_GUIDE_MATRIX_QUADRANTS.find((q) => q.id === "q1")!;
  const q2 = PLAN_GUIDE_MATRIX_QUADRANTS.find((q) => q.id === "q2")!;
  const q3 = PLAN_GUIDE_MATRIX_QUADRANTS.find((q) => q.id === "q3")!;
  const q4 = PLAN_GUIDE_MATRIX_QUADRANTS.find((q) => q.id === "q4")!;

  return (
    <div className="text-[10px]">
      <div className="mb-1 flex items-center gap-1">
        <span className="w-8 shrink-0" />
        <span className="flex-1 text-center font-bold text-black/60">
          {PLAN_GUIDE_MATRIX_AXIS_URGENCY}
        </span>
      </div>
      <div className="flex gap-1">
        <div className="flex w-8 shrink-0 items-center justify-center">
          <span
            className="text-center font-bold text-black/60 [writing-mode:vertical-rl]"
            style={{ textOrientation: "mixed" }}
          >
            {PLAN_GUIDE_MATRIX_AXIS_IMPORTANCE}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 grid grid-cols-2 gap-1 text-center font-semibold text-black/55">
            <span>{PLAN_GUIDE_MATRIX_URGENT}</span>
            <span>{PLAN_GUIDE_MATRIX_NOT_URGENT}</span>
          </div>
          <div className="mb-1 text-center font-semibold text-black/55">
            {PLAN_GUIDE_MATRIX_IMPORTANT}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <QuadrantCell quadrant={q1} />
            <QuadrantCell quadrant={q2} />
          </div>
          <div className="my-1 text-center font-semibold text-black/55">
            {PLAN_GUIDE_MATRIX_NOT_IMPORTANT}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <QuadrantCell quadrant={q3} />
            <QuadrantCell quadrant={q4} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrimeTimeSheetGuide() {
  return (
    <details className="group rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/90 to-orange-50/60 p-4 sm:p-5">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <header className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold tracking-wide text-amber-900">
              {PLAN_GUIDE_STEP_LABEL}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-black/85">
              {PLAN_GUIDE_PRIME_SHEET_INTRO}
            </p>
          </header>
          <span
            className="mt-1 shrink-0 rounded-full border border-amber-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-amber-800 transition group-open:bg-amber-100"
            aria-hidden
          >
            <span className="group-open:hidden">
              {PLAN_GUIDE_TOGGLE_SUMMARY}
            </span>
            <span className="hidden group-open:inline">閉じる</span>
          </span>
        </div>
      </summary>

      <div className="mt-4 flex flex-col gap-4 border-t border-amber-200/60 pt-4">
        <div>
          <h4 className="text-xs font-bold text-amber-950">
            {PLAN_GUIDE_SHEET_STEPS_TITLE}
          </h4>
          <ol className="mt-2 flex flex-col gap-2">
            {PLAN_GUIDE_SHEET_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex gap-2.5 rounded-lg border border-amber-100 bg-white/80 px-3 py-2.5"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-[11px] leading-relaxed text-black/85">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[10px] leading-relaxed text-black/55">
            入力欄との対応：{SHEET_FIELD_HINTS.join(" → ")}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-amber-950">
            {PLAN_GUIDE_EXAMPLE_TITLE}
          </h4>
          <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2 rounded-lg border border-amber-100 bg-white/80 p-3">
              {PLAN_GUIDE_EXAMPLE_FIELDS.map((field) => (
                <div key={field.label}>
                  <p className="text-[10px] font-bold text-black/55">
                    {field.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-black/85">
                    {field.value}
                  </p>
                </div>
              ))}
              <div className="border-t border-amber-100 pt-2">
                <p className="text-[10px] font-bold text-black/55">
                  ⑤ GAPを埋めるための実行リスト
                </p>
                <ul className="mt-1 list-inside list-disc text-[11px] leading-relaxed text-black/85">
                  {PLAN_GUIDE_EXAMPLE_ACTIONS.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white/80 p-3">
              <p className="mb-2 text-center text-[10px] font-bold text-amber-900">
                ⑥ 緊急度と重要度に分類（記入例）
              </p>
              <ExampleMatrix />
              <p className="mt-2 border-t border-dashed border-amber-200 pt-2 text-center text-[10px] font-semibold text-amber-900">
                {PLAN_GUIDE_SCHEDULE_NOTE}
              </p>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
