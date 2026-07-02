"use client";

import { useCallback, useState } from "react";
import { ChoiceTheoryView } from "@/components/ChoiceTheoryView";
import { GoalSettingLinkedPhilosophyVision } from "@/components/GoalSettingLinkedPhilosophyVision";
import { GoalStructuringGuide } from "@/components/GoalStructuringGuide";
import { Modal } from "@/components/Modal";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";
import { RoleGoalWorksheetView } from "@/components/RoleGoalWorksheetView";
import { ThinkingExpansionSheetView } from "@/components/ThinkingExpansionSheetView";
import { useAppData } from "@/components/AppDataProvider";
import {
  CHOICE_THEORY_BUTTON_SUBTITLE,
  CHOICE_THEORY_MODAL_TITLE,
  CHOICE_THEORY_NEED_COLORS,
  CHOICE_THEORY_TITLE,
  getChoiceTheoryNeedStyle,
} from "@/lib/choice-theory-content";
import {
  formatGoalDeclarationText,
  type GoalDomainRow,
  type GoalNeedGroup,
  type GoalSetting,
} from "@/lib/goal-setting";
import {
  GS_COL_DOMAIN,
  GS_COL_LONG,
  GS_COL_MEDIUM,
  GS_COL_NEED,
  GS_COL_SHORT,
  GS_CREATED_LABEL,
  GS_DECLARATION_ACHIEVEMENT_LABEL,
  GS_DECLARATION_ACHIEVEMENT_PLACEHOLDER,
  GS_DECLARATION_AGE_LABEL,
  GS_DECLARATION_AGE_SUFFIX,
  GS_DECLARATION_HEADING,
  GS_DECLARATION_HINT,
  GS_OWNER_PREFIX,
  GS_OWNER_SUFFIX,
  GS_SAVE_HINT,
  GS_SHEET_TITLE,
} from "@/lib/goal-setting-labels";
import {
  ROLE_GOAL_BUTTON_SUBTITLE,
  ROLE_GOAL_MODAL_TITLE,
  ROLE_GOAL_STEP_LABEL,
  ROLE_GOAL_TITLE,
} from "@/lib/role-goal-worksheet-content";
import {
  TES_BUTTON_SUBTITLE,
  TES_MODAL_TITLE,
  TES_STEP_LABEL,
  TES_TITLE,
} from "@/lib/thinking-expansion-sheet-content";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm text-black placeholder:text-black/35 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";

const textareaClass = `${inputClass} min-h-[4.5rem] resize-y leading-relaxed`;

const declarationInputClass =
  "rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-sm text-red-800 placeholder:text-red-300/60 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-400";

const declarationTextareaClass = `${declarationInputClass} min-h-[4rem] w-full resize-y leading-relaxed font-semibold`;

export function GoalSettingView() {
  const { getGoalSetting, updateGoalSetting } = useAppData();
  const data = getGoalSetting();
  const [choiceTheoryOpen, setChoiceTheoryOpen] = useState(false);
  const [roleGoalOpen, setRoleGoalOpen] = useState(false);
  const [expansionOpen, setExpansionOpen] = useState(false);

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

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setChoiceTheoryOpen(true)}
          className="group flex w-full max-w-md items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
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

        <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRoleGoalOpen(true)}
          className="group flex h-full min-w-0 items-center gap-3 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 px-4 py-3 text-left shadow-sm transition-all hover:border-sky-300 hover:shadow-md"
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-white text-[10px] font-bold leading-tight text-sky-800"
            aria-hidden
          >
            Step3
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-black">
              {ROLE_GOAL_TITLE}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-black/65">
              {ROLE_GOAL_BUTTON_SUBTITLE}
            </span>
            <span className="mt-1 block text-[10px] font-semibold text-sky-700">
              {ROLE_GOAL_STEP_LABEL}
            </span>
          </span>
          <span
            className="shrink-0 text-lg text-sky-400 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            <OpenLayerArrow className="text-base text-sky-400" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setExpansionOpen(true)}
          className="group flex h-full min-w-0 items-center gap-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-4 py-3 text-left shadow-sm transition-all hover:border-violet-300 hover:shadow-md"
        >
          <span
            className="grid h-11 w-11 shrink-0 grid-cols-3 grid-rows-3 gap-px rounded-lg border border-violet-200 bg-violet-100 p-1"
            aria-hidden
          >
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                className={`rounded-[1px] ${i === 4 ? "bg-violet-500" : "bg-violet-300/70"}`}
              />
            ))}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-black">{TES_TITLE}</span>
            <span className="mt-0.5 block text-[11px] font-medium text-black/65">
              {TES_BUTTON_SUBTITLE}
            </span>
            <span className="mt-1 block text-[10px] font-semibold text-violet-700">
              {TES_STEP_LABEL}
            </span>
          </span>
          <span
            className="shrink-0 text-lg text-violet-400 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            <OpenLayerArrow className="text-base text-violet-400" />
          </span>
        </button>
        </div>
      </div>

      <GoalStructuringGuide />

      <GoalSettingLinkedPhilosophyVision />

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

      <section className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50/90 to-white p-4 shadow-sm">
        <h4 className="text-base font-bold text-red-950">{GS_DECLARATION_HEADING}</h4>
        <p className="mt-1.5 text-sm leading-relaxed text-black/70">
          {GS_DECLARATION_HINT}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
          <label className="flex shrink-0 flex-col gap-1">
            <span className="text-xs font-semibold text-black/75">
              {GS_DECLARATION_AGE_LABEL}
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="numeric"
                value={data.goalDeclaration.targetAge}
                onChange={(e) =>
                  patch({
                    goalDeclaration: {
                      ...data.goalDeclaration,
                      targetAge: e.target.value,
                    },
                  })
                }
                className={`${declarationInputClass} w-20 text-center text-lg font-bold`}
                placeholder="54"
                aria-label={GS_DECLARATION_AGE_LABEL}
              />
              <span className="text-sm font-semibold text-red-900/80">
                {GS_DECLARATION_AGE_SUFFIX}
              </span>
            </div>
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-semibold text-black/75">
              {GS_DECLARATION_ACHIEVEMENT_LABEL}
            </span>
            <textarea
              value={data.goalDeclaration.achievement}
              onChange={(e) =>
                patch({
                  goalDeclaration: {
                    ...data.goalDeclaration,
                    achievement: e.target.value,
                  },
                })
              }
              rows={2}
              className={declarationTextareaClass}
              placeholder={GS_DECLARATION_ACHIEVEMENT_PLACEHOLDER}
              aria-label={GS_DECLARATION_ACHIEVEMENT_LABEL}
            />
          </label>
        </div>
        {formatGoalDeclarationText(data.goalDeclaration) ? (
          <p className="mt-3 rounded-md border border-red-200/80 bg-white/80 px-3 py-2.5 text-base font-bold leading-relaxed text-red-700 sm:text-lg">
            {formatGoalDeclarationText(data.goalDeclaration)}
          </p>
        ) : null}
      </section>

      {expansionOpen ? (
        <Modal
          title={TES_MODAL_TITLE}
          onClose={() => setExpansionOpen(false)}
          plan
        >
          <ThinkingExpansionSheetView />
        </Modal>
      ) : null}

      {roleGoalOpen ? (
        <Modal
          title={ROLE_GOAL_MODAL_TITLE}
          onClose={() => setRoleGoalOpen(false)}
          plan
        >
          <RoleGoalWorksheetView />
        </Modal>
      ) : null}

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
