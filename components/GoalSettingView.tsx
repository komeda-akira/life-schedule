"use client";

import { useCallback, useState } from "react";
import { ChoiceTheoryView } from "@/components/ChoiceTheoryView";
import { Modal } from "@/components/Modal";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";
import { useAppData } from "@/components/AppDataProvider";
import {
  CHOICE_THEORY_BUTTON_SUBTITLE,
  CHOICE_THEORY_MODAL_TITLE,
  CHOICE_THEORY_NEED_COLORS,
  CHOICE_THEORY_TITLE,
  getChoiceTheoryNeedStyle,
} from "@/lib/choice-theory-content";
import type { GoalDomainRow, GoalNeedGroup, GoalSetting } from "@/lib/goal-setting";
import {
  GS_COL_DOMAIN,
  GS_COL_LONG,
  GS_COL_MEDIUM,
  GS_COL_NEED,
  GS_COL_SHORT,
  GS_CREATED_LABEL,
  GS_OWNER_PREFIX,
  GS_OWNER_SUFFIX,
  GS_PHILOSOPHY_LABEL,
  GS_SAVE_HINT,
  GS_SHEET_TITLE,
  GS_VISION_LABEL,
} from "@/lib/goal-setting-labels";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black placeholder:text-black/35 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";

const textareaClass = `${inputClass} min-h-[4.5rem] resize-y leading-relaxed`;

export function GoalSettingView() {
  const { getGoalSetting, updateGoalSetting } = useAppData();
  const data = getGoalSetting();
  const [choiceTheoryOpen, setChoiceTheoryOpen] = useState(false);

  const patch = useCallback(
    (partial: Partial<GoalSetting>) => {
      updateGoalSetting(partial);
    },
    [updateGoalSetting],
  );

  const updateGroups = (groups: GoalNeedGroup[]) => {
    patch({ groups });
  };

  const updateDomainGoals = (
    groupIndex: number,
    domainIndex: number,
    goals: Partial<GoalDomainRow["goals"]>,
  ) => {
    const groups = data.groups.map((g, gi) => {
      if (gi !== groupIndex) return g;
      return {
        ...g,
        domains: g.domains.map((d, di) => {
          if (di !== domainIndex) return d;
          return { ...d, goals: { ...d.goals, ...goals } };
        }),
      };
    });
    updateGroups(groups);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 font-sans text-black">
      <header className="w-full text-center">
        <h3 className="text-lg font-bold tracking-tight">{GS_SHEET_TITLE}</h3>
        <p className="mt-1 text-base font-semibold">
          {GS_OWNER_PREFIX}
          <input
            type="text"
            value={data.ownerName}
            onChange={(e) => patch({ ownerName: e.target.value })}
            className="mx-1 inline-block max-w-[8rem] border-b border-zinc-400 bg-transparent px-1 text-center font-semibold focus:border-zinc-600 focus:outline-none"
            aria-label="名前"
          />
          {GS_OWNER_SUFFIX}
        </p>
        <label className="mt-2 inline-flex items-center gap-2 text-xs text-black/70">
          <span>{GS_CREATED_LABEL}</span>
          <input
            type="text"
            value={data.createdDate}
            onChange={(e) => patch({ createdDate: e.target.value })}
            className="border-b border-zinc-300 bg-transparent px-1 text-xs focus:border-zinc-500 focus:outline-none"
          />
        </label>
        <p className="mt-3 text-[11px] text-black/55">{GS_SAVE_HINT}</p>
      </header>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => setChoiceTheoryOpen(true)}
          className="group flex max-w-md items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
        >
          <span
            className="flex h-11 w-11 shrink-0 flex-col gap-0.5 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5"
            aria-hidden
          >
            {CHOICE_THEORY_NEED_COLORS.map((need) => (
              <span
                key={need.label}
                className={`min-h-0 flex-1 rounded-sm ${need.className}`}
              />
            ))}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-black">
              {CHOICE_THEORY_TITLE}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-black/65">
              {CHOICE_THEORY_BUTTON_SUBTITLE}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {CHOICE_THEORY_NEED_COLORS.map((need) => (
                <span
                  key={need.label}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-1.5 py-0.5 text-[10px] font-semibold text-black/75"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${need.className}`}
                  />
                  {need.label}
                </span>
              ))}
            </span>
          </span>
          <span
            className="shrink-0 text-lg text-zinc-400 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            <OpenLayerArrow className="text-base text-zinc-400" />
          </span>
        </button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
          <span className="text-xs font-semibold text-black/80">
            {GS_PHILOSOPHY_LABEL}
          </span>
          <textarea
            value={data.lifePhilosophy}
            onChange={(e) => patch({ lifePhilosophy: e.target.value })}
            rows={2}
            className={textareaClass}
          />
        </label>
        <label className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
          <span className="text-xs font-semibold text-black/80">
            {GS_VISION_LABEL}
          </span>
          <textarea
            value={data.lifeVision}
            onChange={(e) => patch({ lifeVision: e.target.value })}
            rows={2}
            className={textareaClass}
          />
        </label>
      </section>

      <div className="overflow-x-auto rounded-lg border border-zinc-300">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-zinc-100 text-left text-[11px] font-semibold text-black/85">
              <th className="w-[5.5rem] border-b border-r border-zinc-300 px-2 py-2">
                {GS_COL_NEED}
              </th>
              <th className="w-[6.5rem] border-b border-r border-zinc-300 px-2 py-2">
                {GS_COL_DOMAIN}
              </th>
              <th className="border-b border-r border-zinc-300 px-2 py-2">
                {GS_COL_SHORT}
              </th>
              <th className="border-b border-r border-zinc-300 px-2 py-2">
                {GS_COL_MEDIUM}
              </th>
              <th className="border-b border-zinc-300 px-2 py-2">
                {GS_COL_LONG}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.groups.map((needGroup, groupIndex) => {
              const needStyle = getChoiceTheoryNeedStyle(groupIndex);

              return needGroup.domains.map((domain, domainIndex) => {
                const isFirstInGroup = domainIndex === 0;
                const rowSpan = needGroup.domains.length;
                const rowKey = `${groupIndex}-${domainIndex}`;

                return (
                  <tr key={rowKey} className={needStyle.rowBgClass}>
                    {isFirstInGroup ? (
                      <th
                        rowSpan={rowSpan}
                        className={`border-b border-r px-1.5 py-2 align-middle text-center text-[10px] font-bold leading-snug text-black/90 ${needStyle.borderClass} ${needStyle.bgClass}`}
                      >
                        <span
                          className={`mx-auto mb-1.5 block h-1 w-10 rounded-full ${needStyle.colorClass}`}
                          aria-hidden
                        />
                        {needGroup.needLabel}
                      </th>
                    ) : null}
                    <th className="border-b border-r border-zinc-200 bg-white/70 px-1.5 py-2 align-top text-left text-[10px] font-semibold leading-snug text-black/85">
                      {domain.domainLabel}
                    </th>
                    <td className="border-b border-r border-zinc-200 bg-white/60 p-1 align-top">
                      <textarea
                        value={domain.goals.shortTerm}
                        onChange={(e) =>
                          updateDomainGoals(groupIndex, domainIndex, {
                            shortTerm: e.target.value,
                          })
                        }
                        rows={4}
                        className={textareaClass}
                        aria-label={`${domain.domainLabel} ${GS_COL_SHORT}`}
                      />
                    </td>
                    <td className="border-b border-r border-zinc-200 bg-white/60 p-1 align-top">
                      <textarea
                        value={domain.goals.mediumTerm}
                        onChange={(e) =>
                          updateDomainGoals(groupIndex, domainIndex, {
                            mediumTerm: e.target.value,
                          })
                        }
                        rows={3}
                        className={textareaClass}
                        aria-label={`${domain.domainLabel} ${GS_COL_MEDIUM}`}
                      />
                    </td>
                    <td className="border-b border-zinc-200 bg-white/60 p-1 align-top">
                      <textarea
                        value={domain.goals.longTerm}
                        onChange={(e) =>
                          updateDomainGoals(groupIndex, domainIndex, {
                            longTerm: e.target.value,
                          })
                        }
                        rows={2}
                        className={textareaClass}
                        aria-label={`${domain.domainLabel} ${GS_COL_LONG}`}
                      />
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {choiceTheoryOpen ? (
        <Modal
          title={CHOICE_THEORY_MODAL_TITLE}
          onClose={() => setChoiceTheoryOpen(false)}
          wide
        >
          <ChoiceTheoryView />
        </Modal>
      ) : null}
    </div>
  );
}
