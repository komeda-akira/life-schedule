"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { OpenLayerArrow } from "@/components/OpenLayerArrow";
import { YearCalendarSummaryDiagram } from "@/components/YearCalendarSummaryDiagram";
import { useAppData } from "@/components/AppDataProvider";
import { useCalendarCursor } from "@/components/CalendarNavigation";
import { buildYearCommentDigest } from "@/lib/year-calendar-comments";
import {
  heroYearSummaryArrowClass,
  heroYearSummaryButtonClass,
} from "@/lib/hero-brand";
import {
  YCS_BUTTON_TITLE,
  YCS_MODAL_TITLE,
} from "@/lib/year-calendar-summary-content";

export function YearCalendarSummaryButton() {
  const [open, setOpen] = useState(false);
  const { data } = useAppData();
  const cursor = useCalendarCursor();
  const year = cursor.getFullYear();

  const digest = useMemo(
    () => buildYearCommentDigest(data, year),
    [data, year],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={`${YCS_BUTTON_TITLE}（${year}年）`}
        className={heroYearSummaryButtonClass}
      >
        {YCS_BUTTON_TITLE}
        <OpenLayerArrow className={heroYearSummaryArrowClass} />
      </button>
      {open ? (
        <Modal
          title={`${YCS_MODAL_TITLE}（${year}年）`}
          onClose={() => setOpen(false)}
          wide
        >
          <YearCalendarSummaryDiagram digest={digest} />
        </Modal>
      ) : null}
    </>
  );
}
