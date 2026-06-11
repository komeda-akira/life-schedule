"use client";

import {
  CHOICE_THEORY_INTRO,
  CHOICE_THEORY_MODAL_TITLE,
  CHOICE_THEORY_NEEDS,
  CHOICE_THEORY_QUALITY_WORLD,
  CHOICE_THEORY_SHEET_HINT,
} from "@/lib/choice-theory-content";

export function ChoiceTheoryView() {
  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-black">
      <p className="text-center text-base font-bold text-black">
        {CHOICE_THEORY_MODAL_TITLE}
      </p>
      <p className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 text-black/90">
        {CHOICE_THEORY_INTRO}
      </p>
      <ol className="flex flex-col gap-3">
        {CHOICE_THEORY_NEEDS.map((item, index) => (
          <li
            key={item.needLabel}
            className={`rounded-lg border p-4 ${item.borderClass} ${item.bgClass}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${item.colorClass}`}
              >
                {index + 1}
              </span>
              <h4 className="font-bold text-black">{item.needLabel}</h4>
            </div>
            <p className="mt-2 text-black/85">{item.body}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4">
        <p className="text-black/90">{CHOICE_THEORY_QUALITY_WORLD}</p>
        <p className="border-t border-zinc-200 pt-2 text-black/80">
          {CHOICE_THEORY_SHEET_HINT}
        </p>
      </div>
    </div>
  );
}
