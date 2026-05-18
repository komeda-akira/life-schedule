"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useAppData } from "@/components/AppDataProvider";

type ScopeCommentModalProps = {
  scopeKey: string;
  heading: string;
  onClose: () => void;
};

export function ScopeCommentModal({
  scopeKey,
  heading,
  onClose,
}: ScopeCommentModalProps) {
  const { getScopeComment, setScopeComment } = useAppData();
  const [text, setText] = useState(() => getScopeComment(scopeKey));

  const save = () => {
    setScopeComment(scopeKey, text);
    onClose();
  };

  return (
    <Modal title={`スコープコメント — ${heading}`} onClose={onClose} wide>
      <p className="mb-3 text-sm text-black/80">
        この年・月・週についてのメモです。予定とは別に保存されます。
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        placeholder="コメントを入力…"
        autoFocus
      />
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-white"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
        >
          キャンセル
        </button>
      </div>
    </Modal>
  );
}
