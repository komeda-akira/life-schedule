"use client";

import { Modal } from "@/components/Modal";
import { My100YearHistoryView } from "@/components/My100YearHistoryView";
import { MY_100_YEAR_HISTORY_LABEL } from "@/lib/my-100-year-history";

type My100YearHistoryModalProps = {
  onClose: () => void;
};

export function My100YearHistoryModal({ onClose }: My100YearHistoryModalProps) {
  return (
    <Modal title={MY_100_YEAR_HISTORY_LABEL} onClose={onClose} plan>
      <My100YearHistoryView />
    </Modal>
  );
}
