"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { GoalSettingView } from "@/components/GoalSettingView";
import { PurposeVisionView } from "@/components/PurposeVisionView";
import { VisionPhilosophyView } from "@/components/VisionPhilosophyView";
import { useAppData } from "@/components/AppDataProvider";
import {
  NORTH_STAR_LABELS,
  type NorthStarCategory,
  type NorthStarItem,
} from "@/lib/types";

type NorthStarModalProps = {
  category: NorthStarCategory;
  onClose: () => void;
};

export function NorthStarModal({ category, onClose }: NorthStarModalProps) {
  const label = NORTH_STAR_LABELS[category];

  if (category === "vision") {
    return (
      <Modal title={label} onClose={onClose} plan>
        <VisionPhilosophyView />
      </Modal>
    );
  }

  if (category === "purpose") {
    return (
      <Modal title={label} onClose={onClose} plan>
        <PurposeVisionView />
      </Modal>
    );
  }

  if (category === "goal") {
    return (
      <Modal title={label} onClose={onClose} plan>
        <GoalSettingView />
      </Modal>
    );
  }

  const { northStarFor, upsertNorthStar, deleteNorthStar } = useAppData();
  const items = northStarFor(category);
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<NorthStarItem | null>(null);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setMemo("");
    setMode("form");
  };

  const openEdit = (item: NorthStarItem) => {
    setEditing(item);
    setTitle(item.title);
    setMemo(item.memo ?? "");
    setMode("form");
  };

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    upsertNorthStar({
      id: editing?.id ?? crypto.randomUUID(),
      category,
      title: trimmed,
      memo: memo.trim() || undefined,
      createdAt: editing?.createdAt ?? now,
    });
    setMode("list");
    setEditing(null);
  };

  const remove = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    deleteNorthStar(id);
    setConfirmDeleteId(null);
  };

  return (
    <Modal title={label} onClose={onClose} wide>
      {mode === "list" ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={openNew}
            className="w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-white"
          >
            新規
          </button>
          {items.length === 0 ? (
            <p className="text-sm text-black/60">まだ項目がありません。</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-zinc-200 p-3"
                >
                  <div className="font-medium text-black">
                    {item.title}
                  </div>
                  {item.memo ? (
                    <p className="mt-1 text-sm text-black/80">
                      {item.memo}
                    </p>
                  ) : null}
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="text-sm text-black underline"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="text-sm text-red-600 underline"
                    >
                      {confirmDeleteId === item.id ? "本当に削除" : "削除"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              タイトル <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2"
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">メモ（任意）</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!title.trim()}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setMode("list")}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
            >
              一覧へ
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
