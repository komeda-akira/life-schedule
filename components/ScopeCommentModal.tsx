"use client";

import { useEffect, useState } from "react";
import { AutoGrowTextarea } from "@/components/AutoGrowTextarea";
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

  useEffect(() => {
    setText(getScopeComment(scopeKey));
  }, [scopeKey, getScopeComment]);

  const save = () => {
    setScopeComment(scopeKey, text);
    onClose();
  };

  return (
    <Modal title={`スコープコメント — ${heading}`} onClose={onClose} wide>
      <p className="mb-3 text-sm text-black/80">
        この年・月・週についてのメモです。予定とは別に保存されます。保存すると年ペインの年齢表示の下に反映されます。
      </p>
      <AutoGrowTextarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        minHeightPx={192}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        placeholder="コメントを入力…"
        autoFocus
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
