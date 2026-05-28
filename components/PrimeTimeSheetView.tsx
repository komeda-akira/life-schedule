"use client";

import { useCallback } from "react";
import { useAppData } from "@/components/AppDataProvider";
import type { PrimeTimeSheetContent, PrimeTimeSheetPage } from "@/lib/prime-time-sheet";
import { PRIME_ACTION_ITEM_COUNT } from "@/lib/prime-time-sheet";
import {
  PTS_ADD_PAGE,
  PTS_CREATED,
  PTS_DELETE_PAGE,
  PTS_HIGH,
  PTS_IMPORTANCE,
  PTS_LOW,
  PTS_PAGE_TITLE,
  PTS_PAGES,
  PTS_Q2_HINT,
  PTS_Q2_LABEL,
  PTS_Q3_LABEL,
  PTS_Q4_LABEL,
  PTS_S1,
  PTS_S2,
  PTS_S2_BY,
  PTS_S2_WHAT,
  PTS_S3,
  PTS_S4,
  PTS_S5,
  PTS_S6,
  PTS_SAVE_HINT,
  PTS_SUBTITLE,
  PTS_TITLE,
  PTS_URGENCY,
} from "@/lib/prime-time-sheet-labels";

const inputClass =
  "w-full border-0 border-b border-zinc-400 bg-transparent px-1 py-1 text-sm text-black placeholder:text-black/30 focus:border-zinc-600 focus:outline-none";

const textareaClass =
  "w-full resize-y rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm leading-relaxed text-black placeholder:text-black/30 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";

const sectionTitleClass =
  "mb-1 text-sm font-bold tracking-tight text-black";

const numberedBoxClass =
  "rounded border-2 border-zinc-800 bg-white p-2.5";

function PrimeTimeSheetPageEditor({
  page,
  onPatch,
}: {
  page: PrimeTimeSheetPage;
  onPatch: (
    partial: Partial<PrimeTimeSheetContent> & { title?: string },
  ) => void;
}) {
  const patch = useCallback(
    (partial: Partial<PrimeTimeSheetContent>) => {
      onPatch(partial);
    },
    [onPatch],
  );

  const updateAction = (index: number, value: string) => {
    const actionItems = [...page.actionItems];
    actionItems[index] = value;
    patch({ actionItems });
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-200 pb-2">
        <div>
          <h3 className="text-base font-bold tracking-tight">{PTS_TITLE}</h3>
          <p className="text-xs text-black/70">{PTS_SUBTITLE}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-xs text-black/80">
          <input
            type="text"
            value={page.createdYear}
            onChange={(e) => patch({ createdYear: e.target.value })}
            placeholder="年"
            className="w-12 border-b border-zinc-400 bg-transparent text-center focus:outline-none"
          />
          <span>年</span>
          <input
            type="text"
            value={page.createdMonth}
            onChange={(e) => patch({ createdMonth: e.target.value })}
            placeholder="月"
            className="w-8 border-b border-zinc-400 bg-transparent text-center focus:outline-none"
          />
          <span>月</span>
          <input
            type="text"
            value={page.createdDay}
            onChange={(e) => patch({ createdDay: e.target.value })}
            placeholder="日"
            className="w-8 border-b border-zinc-400 bg-transparent text-center focus:outline-none"
          />
          <span>日{PTS_CREATED}</span>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-black/80">
          {PTS_PAGE_TITLE}
        </span>
        <input
          type="text"
          value={page.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          className={inputClass}
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <section className={numberedBoxClass}>
            <h4 className={sectionTitleClass}>{PTS_S1}</h4>
            <textarea
              value={page.achieveGoal}
              onChange={(e) => patch({ achieveGoal: e.target.value })}
              rows={3}
              className={textareaClass}
            />
          </section>

          <section className={numberedBoxClass}>
            <h4 className={sectionTitleClass}>{PTS_S2}</h4>
            <div className="space-y-2">
              <label className="block">
                <span className="mb-0.5 block text-xs font-bold text-black/80">
                  {PTS_S2_WHAT}
                </span>
                <input
                  type="text"
                  value={page.indicatorWhat}
                  onChange={(e) => patch({ indicatorWhat: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-0.5 block text-xs font-bold text-black/80">
                  {PTS_S2_BY}
                </span>
                <input
                  type="text"
                  value={page.indicatorByWhen}
                  onChange={(e) => patch({ indicatorByWhen: e.target.value })}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className={numberedBoxClass}>
            <h4 className={sectionTitleClass}>{PTS_S3}</h4>
            <input
              type="text"
              value={page.currentState}
              onChange={(e) => patch({ currentState: e.target.value })}
              className={inputClass}
            />
          </section>

          <section className={numberedBoxClass}>
            <h4 className={sectionTitleClass}>{PTS_S4}</h4>
            <input
              type="text"
              value={page.gap}
              onChange={(e) => patch({ gap: e.target.value })}
              className={inputClass}
            />
          </section>

          <section className={numberedBoxClass}>
            <h4 className={sectionTitleClass}>{PTS_S5}</h4>
            <ol className="list-decimal space-y-1.5 pl-5">
              {Array.from({ length: PRIME_ACTION_ITEM_COUNT }, (_, i) => (
                <li key={i} className="text-sm">
                  <input
                    type="text"
                    value={page.actionItems[i] ?? ""}
                    onChange={(e) => updateAction(i, e.target.value)}
                    placeholder={`${i + 1}.`}
                    className={`${inputClass} border-dashed`}
                  />
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className={`${numberedBoxClass} flex flex-col`}>
          <h4 className={`${sectionTitleClass} text-center`}>{PTS_S6}</h4>

          <div className="min-h-0 flex-1 overflow-x-auto">
            <table className="w-full min-w-[280px] table-fixed border-collapse text-xs">
              <thead>
                <tr>
                  <th className="w-14 border border-zinc-800 bg-zinc-100 p-1" />
                  <th
                    colSpan={2}
                    className="border border-zinc-800 bg-zinc-100 p-1 text-center font-bold"
                  >
                    {PTS_URGENCY}
                  </th>
                </tr>
                <tr>
                  <th className="border border-zinc-800 bg-zinc-100 p-1" />
                  <th className="border border-zinc-800 bg-zinc-50 p-1 text-center font-bold">
                    {PTS_HIGH}
                  </th>
                  <th className="border border-zinc-800 bg-zinc-50 p-1 text-center font-bold">
                    {PTS_LOW}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="border border-zinc-800 bg-zinc-100 px-1 py-2 text-center align-middle font-bold leading-tight">
                    <span className="block text-[10px]">{PTS_IMPORTANCE}</span>
                    <span className="mt-0.5 block">{PTS_HIGH}</span>
                  </th>
                  <td className="border border-zinc-800 p-1 align-top">
                    <textarea
                      value={page.quadrant1}
                      onChange={(e) => patch({ quadrant1: e.target.value })}
                      rows={8}
                      className={`${textareaClass} min-h-[9rem] border-0`}
                    />
                  </td>
                  <td className="border border-zinc-800 bg-zinc-50/40 p-1 align-top">
                    <p className="mb-1 text-center text-[10px] font-bold text-black/70">
                      {PTS_Q2_LABEL}
                      <span className="ml-0.5 text-amber-600" aria-hidden>
                        ★
                      </span>
                    </p>
                    <textarea
                      value={page.quadrant2}
                      onChange={(e) => patch({ quadrant2: e.target.value })}
                      rows={7}
                      className={`${textareaClass} min-h-[7.5rem] border-0 bg-transparent`}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="border border-zinc-800 bg-zinc-100 px-1 py-2 text-center align-middle font-bold leading-tight">
                    <span className="block text-[10px]">{PTS_IMPORTANCE}</span>
                    <span className="mt-0.5 block">{PTS_LOW}</span>
                  </th>
                  <td className="border border-zinc-800 p-1 align-top">
                    <p className="mb-1 text-center text-[10px] font-bold text-black/70">
                      {PTS_Q3_LABEL}
                    </p>
                    <textarea
                      value={page.quadrant3}
                      onChange={(e) => patch({ quadrant3: e.target.value })}
                      rows={5}
                      className={`${textareaClass} min-h-[5rem] border-0`}
                    />
                  </td>
                  <td className="border border-zinc-800 p-1 align-top">
                    <p className="mb-1 text-center text-[10px] font-bold text-black/70">
                      {PTS_Q4_LABEL}
                    </p>
                    <textarea
                      value={page.quadrant4}
                      onChange={(e) => patch({ quadrant4: e.target.value })}
                      rows={5}
                      className={`${textareaClass} min-h-[5rem] border-0`}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-2 border-t border-dashed border-zinc-300 pt-2 text-center text-[11px] font-medium text-black/75">
            {PTS_Q2_HINT}
          </p>
        </section>
      </div>
    </>
  );
}

export function PrimeTimeSheetView() {
  const {
    getPrimeTimeSheetData,
    updatePrimeTimeSheetPage,
    addPrimeTimeSheetPage,
    deletePrimeTimeSheetPage,
    setActivePrimeTimeSheetPage,
  } = useAppData();

  const data = getPrimeTimeSheetData();
  const activePage =
    data.pages.find((p) => p.id === data.activePageId) ?? data.pages[0];

  if (!activePage) return null;

  return (
    <div className="space-y-4 text-black">
      <p className="text-[10px] text-black/50">{PTS_SAVE_HINT}</p>

      <div className="space-y-2 border-b border-zinc-200 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-black/70">{PTS_PAGES}</span>
          <button
            type="button"
            onClick={addPrimeTimeSheetPage}
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-black hover:bg-zinc-50"
          >
            + {PTS_ADD_PAGE}
          </button>
        </div>
        <div
          className="flex gap-1 overflow-x-auto pb-0.5"
          role="tablist"
          aria-label={PTS_PAGES}
        >
          {data.pages.map((page) => {
            const selected = page.id === data.activePageId;
            return (
              <button
                key={page.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActivePrimeTimeSheetPage(page.id)}
                className={`shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-zinc-500 bg-zinc-200 text-black"
                    : "border-zinc-300 bg-white text-black/80 hover:bg-zinc-50"
                }`}
              >
                {page.title || "（無題）"}
              </button>
            );
          })}
        </div>
        {data.pages.length > 1 ? (
          <button
            type="button"
            onClick={() => deletePrimeTimeSheetPage(activePage.id)}
            className="text-xs text-red-700 underline underline-offset-2 hover:text-red-800"
          >
            {PTS_DELETE_PAGE}
          </button>
        ) : null}
      </div>

      <PrimeTimeSheetPageEditor
        key={activePage.id}
        page={activePage}
        onPatch={(partial) => updatePrimeTimeSheetPage(activePage.id, partial)}
      />
    </div>
  );
}
