"use client";

import { useCallback, type ReactNode } from "react";
import { useAppData } from "@/components/AppDataProvider";
import type { PurposeVision } from "@/lib/purpose-vision";
import {
  PV_ACTIONS_HINT,
  PV_ASPECTS_HINT,
  PV_HINT_INFLUENCE,
  PV_HINT_NUMBER_ONE,
  PV_LABEL_ABILITY,
  PV_LABEL_ACTIONS,
  PV_LABEL_ECONOMIC,
  PV_LABEL_HEALTH,
  PV_LABEL_INFLUENCE,
  PV_LABEL_MOTTO,
  PV_LABEL_NUMBER_ONE,
  PV_LABEL_PURPOSE_SERVICE,
  PV_LABEL_PURPOSE_WHY,
  PV_LABEL_SPIRITUAL,
  PV_LABEL_VISION_MAIN,
  PV_MOTTO_HINT,
  PV_PURPOSE_HEADING,
  PV_PURPOSE_HINT,
  PV_PURPOSE_SERVICE_HINT,
  PV_SAVE_HINT,
  PV_STEP_INTRO,
  PV_STEP_TITLE,
  PV_SUMMARY_TITLE,
  PV_VISION_EXAMPLE,
  PV_VISION_EXAMPLE_LABEL,
  PV_VISION_HEADING,
  PV_VISION_HINT,
} from "@/lib/purpose-vision-labels";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-black placeholder:text-black/35 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400";

const textareaClass = `${inputClass} min-h-[3.5rem] resize-y leading-relaxed`;

const emphasisClass = `${textareaClass} font-medium text-red-700`;

function WorksheetHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] leading-relaxed text-black/65">{children}</p>
  );
}

function WorksheetExample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50/90 px-2.5 py-2">
      <p className="text-[10px] font-semibold text-black/55">{label}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-black/60">
        {children}
      </p>
    </div>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-black/75">{children}</span>
      {hint ? <WorksheetHint>{hint}</WorksheetHint> : null}
    </div>
  );
}

type AspectField = {
  key: keyof PurposeVision;
  label: string;
};

const VISION_ASPECTS: AspectField[] = [
  { key: "visionEconomic", label: PV_LABEL_ECONOMIC },
  { key: "visionAbility", label: PV_LABEL_ABILITY },
  { key: "visionSpiritual", label: PV_LABEL_SPIRITUAL },
  { key: "visionHealth", label: PV_LABEL_HEALTH },
];

export function PurposeVisionView() {
  const { getPurposeVision, updatePurposeVision } = useAppData();
  const data = getPurposeVision();

  const patch = useCallback(
    (partial: Partial<PurposeVision>) => {
      updatePurposeVision(partial);
    },
    [updatePurposeVision],
  );

  const setAction = (index: number, value: string) => {
    const lifePurposeActions = [...data.lifePurposeActions] as string[];
    lifePurposeActions[index] = value;
    patch({
      lifePurposeActions:
        lifePurposeActions as PurposeVision["lifePurposeActions"],
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 text-sm leading-relaxed text-black font-sans">
      <header className="w-full">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-wide text-black/70">
            {PV_STEP_TITLE}
          </p>
          <h3 className="mt-1 text-lg font-bold text-black">
            {PV_SUMMARY_TITLE}
          </h3>
        </div>
        <div className="mt-4 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-3.5 font-sans">
          <p className="text-sm leading-[1.8] text-black/90">{PV_STEP_INTRO}</p>
          <p className="border-t border-zinc-200/90 pt-3 text-sm leading-[1.7] text-black/65">
            {PV_SAVE_HINT}
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/80 p-4">
        <h4 className="border-b border-zinc-300 pb-2 text-base font-bold">
          {PV_PURPOSE_HEADING}
        </h4>
        <WorksheetHint>{PV_PURPOSE_HINT}</WorksheetHint>
        <label className="flex flex-col gap-1">
          <FieldLabel>{PV_LABEL_PURPOSE_WHY}</FieldLabel>
          <textarea
            value={data.lifePurposeLead}
            onChange={(e) => patch({ lifePurposeLead: e.target.value })}
            rows={2}
            className={textareaClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <FieldLabel hint={PV_PURPOSE_SERVICE_HINT}>
            {PV_LABEL_PURPOSE_SERVICE}
          </FieldLabel>
          <textarea
            value={data.lifePurposeService}
            onChange={(e) => patch({ lifePurposeService: e.target.value })}
            rows={2}
            className={emphasisClass}
          />
        </label>
        <div className="flex flex-col gap-2">
          <FieldLabel hint={PV_ACTIONS_HINT}>{PV_LABEL_ACTIONS}</FieldLabel>
          <ol className="flex flex-col gap-2">
            {data.lifePurposeActions.map((text, index) => (
              <li key={index} className="flex gap-2">
                <span className="w-5 shrink-0 pt-2 text-xs font-bold text-black/70">
                  {index + 1}
                </span>
                <textarea
                  value={text}
                  onChange={(e) => setAction(index, e.target.value)}
                  rows={2}
                  className={textareaClass}
                  aria-label={`\u884c\u52d5\u6307\u91dd ${index + 1}`}
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <h4 className="border-b border-zinc-300 pb-2 text-base font-bold">
          {PV_VISION_HEADING}
        </h4>
        <WorksheetHint>{PV_VISION_HINT}</WorksheetHint>
        <WorksheetExample label={PV_VISION_EXAMPLE_LABEL}>
          {PV_VISION_EXAMPLE}
        </WorksheetExample>
        <label className="flex flex-col gap-1">
          <FieldLabel>{PV_LABEL_VISION_MAIN}</FieldLabel>
          <textarea
            value={data.visionMain}
            onChange={(e) => patch({ visionMain: e.target.value })}
            rows={2}
            className={emphasisClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <FieldLabel hint={PV_HINT_NUMBER_ONE}>{PV_LABEL_NUMBER_ONE}</FieldLabel>
          <textarea
            value={data.visionNumberOneMeans}
            onChange={(e) => patch({ visionNumberOneMeans: e.target.value })}
            rows={2}
            className={textareaClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <FieldLabel hint={PV_HINT_INFLUENCE}>{PV_LABEL_INFLUENCE}</FieldLabel>
          <textarea
            value={data.visionInfluenceMeans}
            onChange={(e) => patch({ visionInfluenceMeans: e.target.value })}
            rows={2}
            className={textareaClass}
          />
        </label>
        <div className="flex flex-col gap-2">
          <WorksheetHint>{PV_ASPECTS_HINT}</WorksheetHint>
          <div className="grid gap-2 sm:grid-cols-2">
            {VISION_ASPECTS.map(({ key, label }) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-black/70">
                  {label}
                </span>
                <textarea
                  value={data[key]}
                  onChange={(e) => patch({ [key]: e.target.value })}
                  rows={2}
                  className={textareaClass}
                />
              </label>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1">
          <FieldLabel hint={PV_MOTTO_HINT}>{PV_LABEL_MOTTO}</FieldLabel>
          <input
            type="text"
            value={data.visionMotto}
            onChange={(e) => patch({ visionMotto: e.target.value })}
            className={`${inputClass} text-center text-base font-bold text-red-700`}
          />
        </label>
      </section>
    </div>
  );
}
