"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  /** 中長期行動計画表など横長レイアウト用 */
  plan?: boolean;
  /** ヘッダー左右矢印（前月・前週・前日など） */
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
};

function ModalNavChevron({
  dir,
  label,
  onClick,
}: {
  dir: "prev" | "next";
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-label={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-300 bg-white text-black/80 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="text-base leading-none" aria-hidden>
        {dir === "prev" ? "\u2039" : "\u203A"}
      </span>
    </button>
  );
}

function ModalTitleRow({
  title,
  onClose,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: {
  title: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
}) {
  const showNav = Boolean(onPrev || onNext);
  return (
    <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {showNav ? (
          <ModalNavChevron
            dir="prev"
            label={prevLabel ?? "前へ"}
            onClick={onPrev}
          />
        ) : null}
        <h2
          id="modal-title"
          className="min-w-0 truncate text-base font-semibold text-black"
        >
          {title}
        </h2>
        {showNav ? (
          <ModalNavChevron
            dir="next"
            label={nextLabel ?? "次へ"}
            onClick={onNext}
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-md px-2 py-1 text-sm text-black/80 hover:bg-zinc-100"
      >
        閉じる
      </button>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
  plan,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (plan) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          type="button"
          className="fixed inset-0 bg-black/40"
          aria-label="閉じる"
          onClick={onClose}
        />
        <div className="relative z-10 mx-auto w-full max-w-[min(98vw,1400px)] px-4 pt-6 pb-10">
          <div className="flex w-full flex-col rounded-xl border border-zinc-200 bg-white shadow-xl">
            <ModalTitleRow
              title={title}
              onClose={onClose}
              onPrev={onPrev}
              onNext={onNext}
              prevLabel={prevLabel}
              nextLabel={nextLabel}
            />
            <div className="p-4">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
        className={`relative z-10 flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ${
          wide
            ? "max-h-[min(90vh,720px)] max-w-2xl"
            : "max-h-[min(90vh,720px)] max-w-md"
        }`}
      >
        <ModalTitleRow
          title={title}
          onClose={onClose}
          onPrev={onPrev}
          onNext={onNext}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
        />
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
