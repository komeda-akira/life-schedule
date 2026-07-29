"use client";

import { Modal } from "@/components/Modal";
import { MonthlyWorksheetView } from "@/components/MonthlyWorksheetView";
import { LABEL_NEXT_MONTH, LABEL_PREV_MONTH } from "@/lib/pane-labels";

type MonthlyWorksheetModalProps = {
  monthKey: string;
  year: number;
  month: number;
  heading: string;
  onClose: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
};

export function MonthlyWorksheetModal({
  monthKey,
  year,
  month,
  heading,
  onClose,
  onPrevMonth,
  onNextMonth,
}: MonthlyWorksheetModalProps) {
  return (
    <Modal
      title={heading}
      onClose={onClose}
      plan
      onPrev={onPrevMonth}
      onNext={onNextMonth}
      prevLabel={LABEL_PREV_MONTH}
      nextLabel={LABEL_NEXT_MONTH}
    >
      <MonthlyWorksheetView monthKey={monthKey} year={year} month={month} />
    </Modal>
  );
}
