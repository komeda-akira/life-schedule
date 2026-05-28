"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/Modal";
import { SuccessStepsView } from "@/components/SuccessStepsView";
import { SUCCESS_STEPS_TITLE } from "@/lib/success-steps-content";

type PyramidWithSuccessStepsProps = {
  pyramid: ReactNode;
};

export function PyramidWithSuccessSteps({
  pyramid,
}: PyramidWithSuccessStepsProps) {
  const [stepsOpen, setStepsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-center md:gap-6">
        <div className="min-w-0 w-full max-w-lg flex-1">{pyramid}</div>
        <div className="flex shrink-0 flex-col items-center justify-center md:self-stretch">
          <button
            type="button"
            onClick={() => setStepsOpen(true)}
            className="rounded-lg border-2 border-zinc-800 bg-white px-3 py-5 text-sm font-bold tracking-wide text-black shadow-sm transition-colors hover:bg-zinc-50 [writing-mode:vertical-rl]"
          >
            {SUCCESS_STEPS_TITLE}
          </button>
          <p className="mt-2 max-w-[5rem] text-center text-[10px] text-black/55">
            クリックで5つの手順を表示
          </p>
        </div>
      </div>
      {stepsOpen ? (
        <Modal
          title={SUCCESS_STEPS_TITLE}
          onClose={() => setStepsOpen(false)}
          wide
        >
          <SuccessStepsView />
        </Modal>
      ) : null}
    </>
  );
}
