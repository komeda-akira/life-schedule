"use client";

import { Modal } from "@/components/Modal";
import { DailyWorksheetView } from "@/components/DailyWorksheetView";
import { formatDayHeader } from "@/lib/calendar";
import { LABEL_NEXT_DAY, LABEL_PREV_DAY } from "@/lib/pane-labels";

type DailyWorksheetModalProps = {
  dayKey: string;
  date: Date;
  onClose: () => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
};

export function DailyWorksheetModal({
  dayKey,
  date,
  onClose,
  onPrevDay,
  onNextDay,
}: DailyWorksheetModalProps) {
  return (
    <Modal
      title={formatDayHeader(date)}
      onClose={onClose}
      plan
      onPrev={onPrevDay}
      onNext={onNextDay}
      prevLabel={LABEL_PREV_DAY}
      nextLabel={LABEL_NEXT_DAY}
    >
      <DailyWorksheetView dayKey={dayKey} date={date} />
    </Modal>
  );
}
