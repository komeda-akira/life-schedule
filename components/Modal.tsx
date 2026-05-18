"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  /** 中長期行動計画表など横長レイアウト用 */
  plan?: boolean;
};

export function Modal({ title, onClose, children, wide, plan }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center p-4 ${
        plan ? "items-start pt-6" : "items-center"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex w-full flex-col rounded-xl border border-zinc-200 bg-white shadow-xl ${
          plan
            ? "max-w-[min(98vw,1400px)]"
            : `overflow-hidden ${
                wide
                  ? "max-h-[min(90vh,720px)] max-w-2xl"
                  : "max-h-[min(90vh,720px)] max-w-md"
              }`
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2
            id="modal-title"
            className="text-base font-semibold text-black"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-black/80 hover:bg-zinc-100"
          >
            閉じる
          </button>
        </div>
        <div className={plan ? "p-4" : "min-h-0 flex-1 overflow-y-auto p-4"}>
          {children}
        </div>
      </div>
    </div>
  );
}
