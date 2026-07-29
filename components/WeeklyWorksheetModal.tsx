"use client";

import { Modal } from "@/components/Modal";
import { WeeklyWorksheetView } from "@/components/WeeklyWorksheetView";
import { LABEL_NEXT_WEEK, LABEL_PREV_WEEK } from "@/lib/pane-labels";

type WeeklyWorksheetModalProps = {
  weekKey: string;
  weekMonday: Date;
  heading: string;
  onClose: () => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

export function WeeklyWorksheetModal({
  weekKey,
  weekMonday,
  heading,
  onClose,
  onPrevWeek,
  onNextWeek,
}: WeeklyWorksheetModalProps) {
  return (
    <Modal
      title={heading}
      onClose={onClose}
      plan
      onPrev={onPrevWeek}
      onNext={onNextWeek}
      prevLabel={LABEL_PREV_WEEK}
      nextLabel={LABEL_NEXT_WEEK}
    >
      <WeeklyWorksheetView weekKey={weekKey} weekMonday={weekMonday} />
    </Modal>
  );
}
