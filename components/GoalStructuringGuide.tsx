"use client";

import {
  GS_COL_LONG,
  GS_COL_MEDIUM,
  GS_COL_SHORT,
} from "@/lib/goal-setting-labels";
import {
  GS_GUIDE_CONDITIONS,
  GS_GUIDE_CONDITIONS_TITLE,
  GS_GUIDE_EXAMPLE_HINT,
  GS_GUIDE_EXAMPLE_TITLE,
  GS_GUIDE_EXAMPLES,
  GS_GUIDE_INTRO,
  GS_GUIDE_STEP_LABEL,
  GS_GUIDE_TIMEFRAMES,
  GS_GUIDE_TIMEFRAMES_TITLE,
  GS_GUIDE_TOGGLE_SUMMARY,
} from "@/lib/goal-structuring-guide-content";

export function GoalStructuringGuide() {
  return (
    <details className="group rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-4 sm:p-5">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <header className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold tracking-wide text-emerald-800">
              {GS_GUIDE_STEP_LABEL}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-black/85">
              {GS_GUIDE_INTRO}
            </p>
          </header>
          <span
            className="mt-1 shrink-0 rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-emerald-800 transition group-open:bg-emerald-100"
            aria-hidden
          >
            <span className="group-open:hidden">{GS_GUIDE_TOGGLE_SUMMARY}</span>
            <span className="hidden group-open:inline">閉じる</span>
          </span>
        </div>
      </summary>

      <div className="mt-4 flex flex-col gap-4 border-t border-emerald-200/60 pt-4">
        <div>
          <h4 className="text-xs font-bold text-emerald-950">
            {GS_GUIDE_TIMEFRAMES_TITLE}
          </h4>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {GS_GUIDE_TIMEFRAMES.map((frame) => (
              <div
                key={frame.label}
                className="rounded-lg border border-emerald-100 bg-white/80 px-3 py-2"
              >
                <p className="text-xs font-bold text-emerald-900">{frame.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-black/85">
                  {frame.span}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-black/60">
                  {frame.hint}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-emerald-950">
            {GS_GUIDE_CONDITIONS_TITLE}
          </h4>
          <ol className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {GS_GUIDE_CONDITIONS.map((condition, index) => (
              <li
                key={condition}
                className="flex gap-2 rounded-lg border border-emerald-100 bg-white/70 px-2.5 py-2 text-[11px] leading-relaxed text-black/85"
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                <span>{condition}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="text-xs font-bold text-emerald-950">
            {GS_GUIDE_EXAMPLE_TITLE}
          </h4>
          <p className="mt-1 text-[11px] leading-relaxed text-black/65">
            {GS_GUIDE_EXAMPLE_HINT}
          </p>
          <div className="mt-2 overflow-x-auto rounded-lg border border-emerald-200 bg-white">
            <table className="w-full min-w-[640px] border-collapse text-[11px]">
              <thead>
                <tr className="bg-emerald-100/80 text-left font-semibold text-black/80">
                  <th className="w-[4.5rem] border-b border-r border-emerald-200 px-2 py-2" />
                  <th className="border-b border-r border-emerald-200 px-2 py-2">
                    {GS_COL_SHORT}
                  </th>
                  <th className="border-b border-r border-emerald-200 px-2 py-2">
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden>→</span>
                      {GS_COL_MEDIUM}
                    </span>
                  </th>
                  <th className="border-b border-emerald-200 px-2 py-2">
                    <span className="inline-flex items-center gap-1">
                      <span aria-hidden>→</span>
                      {GS_COL_LONG}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {GS_GUIDE_EXAMPLES.map((row) => (
                  <tr key={row.theme} className="text-black/85">
                    <th className="border-b border-r border-emerald-100 bg-emerald-50/50 px-2 py-2 text-left font-bold text-emerald-950">
                      {row.theme}
                    </th>
                    <td className="border-b border-r border-emerald-100 px-2 py-2 align-top leading-relaxed">
                      {row.shortTerm}
                    </td>
                    <td className="border-b border-r border-emerald-100 px-2 py-2 align-top leading-relaxed">
                      {row.mediumTerm}
                    </td>
                    <td className="border-b border-emerald-100 px-2 py-2 align-top leading-relaxed">
                      {row.longTerm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </details>
  );
}
