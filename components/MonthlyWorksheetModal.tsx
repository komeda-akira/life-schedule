"use client";

import { Modal } from "@/components/Modal";
import { MonthlyWorksheetView } from "@/components/MonthlyWorksheetView";

type MonthlyWorksheetModalProps = {
  monthKey: string;
  year: number;
  month: number;
  heading: string;
  onClose: () => void;
};

export function MonthlyWorksheetModal({
  monthKey,
  year,
  month,
  heading,
  onClose,
}: MonthlyWorksheetModalProps) {
  return (
    <Modal title={heading} onClose={onClose} plan>
      <MonthlyWorksheetView monthKey={monthKey} year={year} month={month} />
    </Modal>
  );
}
