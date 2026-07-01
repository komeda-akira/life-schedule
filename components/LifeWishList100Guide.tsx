"use client";

import {
  LW100_GUIDE_STEP_LABEL,
  LW100_HISTORY_EXAMPLE_TITLE,
  LW100_HISTORY_EXAMPLES,
  LW100_HISTORY_INTRO,
  LW100_HISTORY_NOTE,
  LW100_HISTORY_SECTION_TITLE,
  LW100_HISTORY_TIPS,
  LW100_LIST_EXAMPLE_TITLE,
  LW100_LIST_EXAMPLES,
  LW100_LIST_INTRO,
  LW100_LIST_SECTION_TITLE,
  LW100_LIST_TIPS,
} from "@/lib/life-wish-list-100-guide-content";

export function LifeWishList100Guide() {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50/90 to-orange-50/50 p-4 sm:p-5">
      <header className="text-center">
        <p className="text-xs font-bold tracking-wide text-rose-800">
          {LW100_GUIDE_STEP_LABEL}
        </p>
      </header>

      <div>
        <h4 className="text-xs font-bold text-rose-950">
          {LW100_LIST_SECTION_TITLE}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-black/85">
          {LW100_LIST_INTRO}
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {LW100_LIST_TIPS.map((tip) => (
            <li
              key={tip}
              className="flex gap-2 rounded-lg border border-rose-100 bg-white/80 px-2.5 py-2 text-[11px] leading-relaxed text-black/85"
            >
              <span className="shrink-0 text-rose-600" aria-hidden>
                •
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 overflow-hidden rounded-lg border border-rose-200 bg-white">
          <p className="border-b border-rose-100 bg-rose-100/70 px-3 py-1.5 text-[11px] font-bold text-rose-950">
            {LW100_LIST_EXAMPLE_TITLE}
          </p>
          <ol className="divide-y divide-rose-100">
            {LW100_LIST_EXAMPLES.map((example, index) => (
              <li
                key={example}
                className="flex gap-2 px-3 py-2 text-[11px] leading-relaxed text-black/85"
              >
                <span className="w-5 shrink-0 font-semibold tabular-nums text-rose-800">
                  {index + 1}.
                </span>
                <span>{example}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-rose-950">
          {LW100_HISTORY_SECTION_TITLE}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-black/85">
          {LW100_HISTORY_INTRO}
        </p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {LW100_HISTORY_TIPS.map((tip) => (
            <li
              key={tip}
              className="flex gap-2 rounded-lg border border-rose-100 bg-white/80 px-2.5 py-2 text-[11px] leading-relaxed text-black/85"
            >
              <span className="shrink-0 text-rose-600" aria-hidden>
                •
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 overflow-x-auto rounded-lg border border-rose-200 bg-white">
          <p className="border-b border-rose-100 bg-rose-100/70 px-3 py-1.5 text-[11px] font-bold text-rose-950">
            {LW100_HISTORY_EXAMPLE_TITLE}
          </p>
          <table className="w-full min-w-[280px] border-collapse text-[11px]">
            <tbody>
              {LW100_HISTORY_EXAMPLES.map((row) => (
                <tr key={row.age} className="border-b border-rose-50 last:border-0">
                  <th className="w-14 shrink-0 bg-rose-50/50 px-3 py-1.5 text-left font-bold text-rose-900">
                    {row.age}
                  </th>
                  <td className="px-3 py-1.5 leading-relaxed text-black/85">
                    {row.content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-black/55">
          {LW100_HISTORY_NOTE}
        </p>
      </div>
    </section>
  );
}
