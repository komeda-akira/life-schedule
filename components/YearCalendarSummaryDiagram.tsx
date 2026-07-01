"use client";

import type { YearCommentDigest } from "@/lib/year-calendar-comments";
import {
  YCS_COMMENT_SUBTITLE,
  YCS_EMPTY,
  YCS_MONTH_SCOPE_LABEL,
  YCS_MONTH_SHEET_LABEL,
  YCS_NO_COMMENTS,
  YCS_PLAN_SUMMARY_LABEL,
  YCS_TIMELINE_TITLE,
  YCS_WEEK_SCOPE_LABEL,
  YCS_WEEK_SHEET_LABEL,
  YCS_YEAR_SCOPE_LABEL,
  ycsEntryCountLabel,
} from "@/lib/year-calendar-summary-content";

function CommentBlock({
  label,
  text,
  variant = "default",
}: {
  label: string;
  text: string;
  variant?: "default" | "plan" | "week";
}) {
  const styles = {
    default: "border-zinc-200 bg-white",
    plan: "border-sky-200 bg-sky-50/50",
    week: "border-violet-100 bg-violet-50/40",
  } as const;

  return (
    <div className={`rounded-lg border px-3 py-2 ${styles[variant]}`}>
      <p className="text-[10px] font-bold text-zinc-500">{label}</p>
      <p
        className={`mt-1 whitespace-pre-wrap text-[11px] leading-relaxed ${
          text ? "text-zinc-800" : "text-zinc-400"
        }`}
      >
        {text || YCS_EMPTY}
      </p>
    </div>
  );
}

function MonthHasContent(month: YearCommentDigest["months"][number]): boolean {
  return (
    Boolean(month.scopeComment) ||
    Boolean(month.sheetExcerpt) ||
    month.weeks.some((w) => w.scopeComment || w.sheetExcerpt)
  );
}

type YearCalendarSummaryDiagramProps = {
  digest: YearCommentDigest;
};

export function YearCalendarSummaryDiagram({
  digest,
}: YearCalendarSummaryDiagramProps) {
  const { year, entryCount } = digest;

  return (
    <div className="flex flex-col gap-5 font-sans text-zinc-900">
      <header className="text-center">
        <p className="text-sm leading-relaxed text-zinc-600">
          {YCS_COMMENT_SUBTITLE}
        </p>
        <p className="mt-2 text-xs font-semibold text-sky-800">
          {year}年 — {ycsEntryCountLabel(entryCount)}
        </p>
      </header>

      {entryCount === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          {YCS_NO_COMMENTS}
        </p>
      ) : (
        <>
          <section className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-4">
            <h4 className="text-sm font-bold text-amber-950">{year}年</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <CommentBlock
                label={YCS_YEAR_SCOPE_LABEL}
                text={digest.yearScopeComment}
              />
              <CommentBlock
                label={YCS_PLAN_SUMMARY_LABEL}
                text={digest.planSummary}
                variant="plan"
              />
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-zinc-800">
              {YCS_TIMELINE_TITLE}
            </h4>
            <div className="relative mt-4 flex flex-col gap-4 pl-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-0.5 before:bg-zinc-200">
              {digest.months.map((month) => {
                const hasContent = MonthHasContent(month);
                return (
                  <article key={month.month} className="relative">
                    <div
                      className={`absolute -left-4 top-3 h-3.5 w-3.5 rounded-full border-2 ${
                        hasContent
                          ? "border-sky-500 bg-sky-100"
                          : "border-zinc-300 bg-zinc-100"
                      }`}
                      aria-hidden
                    />
                    <div
                      className={`rounded-xl border p-3 ${
                        hasContent
                          ? "border-zinc-200 bg-white shadow-sm"
                          : "border-zinc-100 bg-zinc-50/60"
                      }`}
                    >
                      <h5 className="text-xs font-bold text-zinc-900">
                        {month.label}
                      </h5>

                      {hasContent ? (
                        <div className="mt-2 flex flex-col gap-2">
                          {(month.scopeComment || month.sheetExcerpt) && (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {month.scopeComment ? (
                                <CommentBlock
                                  label={YCS_MONTH_SCOPE_LABEL}
                                  text={month.scopeComment}
                                />
                              ) : null}
                              {month.sheetExcerpt ? (
                                <CommentBlock
                                  label={YCS_MONTH_SHEET_LABEL}
                                  text={month.sheetExcerpt}
                                />
                              ) : null}
                            </div>
                          )}

                          {month.weeks.length > 0 ? (
                            <ul className="mt-1 flex flex-col gap-2 border-l-2 border-violet-100 pl-3">
                              {month.weeks.map((week) => (
                                <li key={week.weekKey}>
                                  <p className="text-[10px] font-bold text-violet-900">
                                    {week.label}
                                  </p>
                                  <div className="mt-1 grid gap-2 sm:grid-cols-2">
                                    {week.scopeComment ? (
                                      <CommentBlock
                                        label={YCS_WEEK_SCOPE_LABEL}
                                        text={week.scopeComment}
                                        variant="week"
                                      />
                                    ) : null}
                                    {week.sheetExcerpt ? (
                                      <CommentBlock
                                        label={YCS_WEEK_SHEET_LABEL}
                                        text={week.sheetExcerpt}
                                        variant="week"
                                      />
                                    ) : null}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-1 text-[11px] text-zinc-400">
                          {YCS_EMPTY}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
