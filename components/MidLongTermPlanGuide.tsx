"use client";

import { MLTP_LABELS } from "@/lib/mid-long-term-plan";
import {
  MLTP_GUIDE_EXAMPLE_FAMILY,
  MLTP_GUIDE_EXAMPLE_GOALS,
  MLTP_GUIDE_EXAMPLE_PRIORITY,
  MLTP_GUIDE_EXAMPLE_THEMES,
  MLTP_GUIDE_EXAMPLE_TITLE,
  MLTP_GUIDE_INTRO,
  MLTP_GUIDE_SECTIONS,
  MLTP_GUIDE_STEP_LABEL,
  MLTP_GUIDE_STEPS,
  MLTP_GUIDE_STEPS_TITLE,
  MLTP_GUIDE_TITLE,
  MLTP_GUIDE_TOGGLE_SUMMARY,
} from "@/lib/mid-long-term-plan-guide-content";

export function MidLongTermPlanGuide() {
  return (
    <details className="group rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/90 to-indigo-50/50 p-4 sm:p-5">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <header className="min-w-0 flex-1 text-left">
            <p className="text-xs font-bold tracking-wide text-violet-800">
              {MLTP_GUIDE_STEP_LABEL}
            </p>
            <h4 className="mt-1 text-sm font-bold text-violet-950">
              {MLTP_GUIDE_TITLE}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-black/85">
              {MLTP_GUIDE_INTRO}
            </p>
          </header>
          <span
            className="mt-1 shrink-0 rounded-full border border-violet-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-violet-800 transition group-open:bg-violet-100"
            aria-hidden
          >
            <span className="group-open:hidden">{MLTP_GUIDE_TOGGLE_SUMMARY}</span>
            <span className="hidden group-open:inline">閉じる</span>
          </span>
        </div>
      </summary>

      <div className="mt-4 flex flex-col gap-4 border-t border-violet-200/60 pt-4">
        <div>
          <p className="text-xs font-bold text-violet-950">
            {MLTP_GUIDE_STEPS_TITLE}
          </p>
          <ol className="mt-2 flex flex-col gap-2">
            {MLTP_GUIDE_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex gap-2.5 rounded-lg border border-violet-100 bg-white/80 px-3 py-2.5"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-[11px] leading-relaxed text-black/85">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-xs font-bold text-violet-950">シート上の場所</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {MLTP_GUIDE_SECTIONS.map((section) => (
              <li
                key={section.label}
                className="rounded-lg border border-violet-100 bg-white/70 px-2.5 py-2 text-[10px] leading-relaxed"
              >
                <span className="font-bold text-violet-950">{section.label}</span>
                <span className="text-black/65"> → {section.where}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold text-violet-950">
            {MLTP_GUIDE_EXAMPLE_TITLE}
          </p>
          <div className="mt-2 space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-violet-100 bg-white/80 p-3">
                <p className="text-[10px] font-bold text-black/55">
                  {MLTP_LABELS.priorityGoal}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-black/85">
                  {MLTP_GUIDE_EXAMPLE_PRIORITY}
                </p>
              </div>
              <div className="rounded-lg border border-violet-100 bg-white/80 p-3">
                <p className="text-[10px] font-bold text-black/55">
                  {MLTP_LABELS.goals}
                </p>
                <ol className="mt-1 list-inside list-decimal text-[11px] leading-relaxed text-black/85">
                  {MLTP_GUIDE_EXAMPLE_GOALS.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-3">
              <p className="text-[10px] font-bold text-sky-900">
                {MLTP_LABELS.familySectionTitle}
              </p>
              <ul className="mt-1 flex flex-wrap gap-2 text-[11px] text-black/85">
                {MLTP_GUIDE_EXAMPLE_FAMILY.map((member) => (
                  <li
                    key={member.name}
                    className="rounded-full bg-white px-2 py-0.5 ring-1 ring-sky-200"
                  >
                    {member.name}（{member.age}歳）
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[10px] text-black/55">
                → {MLTP_LABELS.tableSectionFamily}に満年齢が自動表示
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-violet-200 bg-white">
              <table className="w-full min-w-[560px] border-collapse text-[10px]">
                <thead>
                  <tr className="bg-violet-100/80 text-left font-semibold text-black/75">
                    <th className="border-b border-r border-violet-200 px-2 py-2">
                      {MLTP_LABELS.colThemeName}
                    </th>
                    <th className="border-b border-r border-violet-200 px-2 py-2">
                      {MLTP_LABELS.colThemeOverview}
                    </th>
                    <th className="border-b border-violet-200 px-2 py-2">
                      年列（例）
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MLTP_GUIDE_EXAMPLE_THEMES.map((row) => (
                    <tr key={row.themeName} className="text-black/85">
                      <th className="border-b border-r border-violet-100 bg-violet-50/50 px-2 py-2 align-top text-left font-bold text-violet-950">
                        {row.themeName}
                      </th>
                      <td className="border-b border-r border-violet-100 px-2 py-2 align-top leading-relaxed">
                        <p>
                          <span className="font-semibold text-black/55">①</span>{" "}
                          {row.overview}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold text-black/55">②</span>{" "}
                          {row.supplement}
                        </p>
                      </td>
                      <td className="border-b border-violet-100 px-2 py-2 align-top leading-relaxed">
                        <ul className="space-y-1">
                          {row.yearPlans.map((entry) => (
                            <li key={entry.year}>
                              <span className="font-semibold">{entry.year}年：</span>
                              {entry.plan}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
