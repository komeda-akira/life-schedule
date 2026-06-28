"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";
import { SuccessStepsView } from "@/components/SuccessStepsView";
import { SUCCESS_STEPS_TITLE } from "@/lib/success-steps-content";

export function SuccessStepsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="5つの手順を表示"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200/90 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-amber-900 shadow-sm transition hover:border-amber-300 hover:bg-amber-50/60 sm:px-3 sm:py-1.5 sm:text-sm"
      >
        {SUCCESS_STEPS_TITLE}
        <OpenLayerArrow className="text-amber-700/60" />
      </button>
      {open ? (
        <Modal title={SUCCESS_STEPS_TITLE} onClose={() => setOpen(false)} wide>
          <SuccessStepsView />
        </Modal>
      ) : null}
    </>
  );
}
