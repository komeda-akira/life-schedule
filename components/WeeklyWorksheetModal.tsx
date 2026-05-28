"use client";

import { Modal } from "@/components/Modal";
import { WeeklyWorksheetView } from "@/components/WeeklyWorksheetView";

type WeeklyWorksheetModalProps = {
  weekKey: string;
  weekMonday: Date;
  heading: string;
  onClose: () => void;
};

export function WeeklyWorksheetModal({
  weekKey,
  weekMonday,
  heading,
  onClose,
}: WeeklyWorksheetModalProps) {
  return (
    <Modal title={heading} onClose={onClose} plan>
      <WeeklyWorksheetView weekKey={weekKey} weekMonday={weekMonday} />
    </Modal>
  );
}
