"use client";

import { Modal } from "@/components/Modal";
import { DailyWorksheetView } from "@/components/DailyWorksheetView";
import { formatDayHeader } from "@/lib/calendar";

type DailyWorksheetModalProps = {
  dayKey: string;
  date: Date;
  onClose: () => void;
};

export function DailyWorksheetModal({
  dayKey,
  date,
  onClose,
}: DailyWorksheetModalProps) {
  return (
    <Modal title={formatDayHeader(date)} onClose={onClose} plan>
      <DailyWorksheetView dayKey={dayKey} date={date} />
    </Modal>
  );
}
