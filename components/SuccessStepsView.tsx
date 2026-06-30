"use client";

import { SuccessStepBadge } from "@/components/SuccessStepBadge";
import {
  SUCCESS_STEPS,
  SUCCESS_STEPS_TITLE,
} from "@/lib/success-steps-content";

export function SuccessStepsView() {
  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-black">
      <p className="text-center text-base font-bold text-black">
        {SUCCESS_STEPS_TITLE}
      </p>
      <ol className="flex flex-col gap-4">
        {SUCCESS_STEPS.map((item) => (
          <li
            key={item.step}
            className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4"
          >
            <div className="flex items-center gap-2">
              <SuccessStepBadge step={item.step} size="md" />
              <h4 className="font-bold text-black">{item.title}</h4>
            </div>
            <p className="mt-2 text-black/85">{item.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
