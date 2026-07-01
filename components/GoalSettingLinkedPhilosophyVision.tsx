"use client";

import { useAppData } from "@/components/AppDataProvider";
import {
  GS_LINKED_PHILOSOPHY_EMPTY,
  GS_LINKED_SECTION_HINT,
  GS_LINKED_VISION_EMPTY,
  linkedPhilosophyText,
  linkedVisionText,
} from "@/lib/goal-setting-linked-content";
import {
  GS_PHILOSOPHY_LABEL,
  GS_VISION_LABEL,
} from "@/lib/goal-setting-labels";

export function GoalSettingLinkedPhilosophyVision() {
  const { getLifePhilosophy, getPurposeVision, getGoalSetting } = useAppData();
  const philosophy = getLifePhilosophy();
  const purposeVision = getPurposeVision();
  const goalSetting = getGoalSetting();

  const philosophyText = linkedPhilosophyText(
    philosophy,
    goalSetting.lifePhilosophy,
  );
  const visionText = linkedVisionText(purposeVision, goalSetting.lifeVision);

  return (
    <section className="flex flex-col gap-2">
      <p className="text-[11px] leading-relaxed text-black/55">
        {GS_LINKED_SECTION_HINT}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
          <span className="text-xs font-semibold text-black/80">
            {GS_PHILOSOPHY_LABEL}
          </span>
          <p
            className={`min-h-[4.5rem] whitespace-pre-wrap rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-sm leading-relaxed ${
              philosophyText ? "text-black" : "text-black/35"
            }`}
          >
            {philosophyText || GS_LINKED_PHILOSOPHY_EMPTY}
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
          <span className="text-xs font-semibold text-black/80">
            {GS_VISION_LABEL}
          </span>
          <p
            className={`min-h-[4.5rem] whitespace-pre-wrap rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-sm leading-relaxed ${
              visionText ? "text-black" : "text-black/35"
            }`}
          >
            {visionText || GS_LINKED_VISION_EMPTY}
          </p>
        </div>
      </div>
    </section>
  );
}
