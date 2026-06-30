"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";
import { SuccessStepsView } from "@/components/SuccessStepsView";
import {
  heroSuccessStepsArrowClass,
  heroSuccessStepsButtonClass,
} from "@/lib/hero-brand";
import { SUCCESS_STEPS_TITLE } from "@/lib/success-steps-content";

export function SuccessStepsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`${SUCCESS_STEPS_TITLE}を表示`}
        className={heroSuccessStepsButtonClass}
      >
        {SUCCESS_STEPS_TITLE}
        <OpenLayerArrow className={heroSuccessStepsArrowClass} />
      </button>
      {open ? (
        <Modal title={SUCCESS_STEPS_TITLE} onClose={() => setOpen(false)} wide>
          <SuccessStepsView />
        </Modal>
      ) : null}
    </>
  );
}
