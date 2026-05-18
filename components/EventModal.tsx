"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useAppData } from "@/components/AppDataProvider";
import type { CalendarEvent, EventKind } from "@/lib/types";

type EventModalProps = {
  event: CalendarEvent | null;
  dateKey: string;
  defaultStartMin?: number;
  defaultKind?: EventKind;
  onClose: () => void;
};

function minutesToInput(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function inputToMinutes(v: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function EventModal({
  event,
  dateKey,
  defaultStartMin = 9 * 60,
  defaultKind = "timed",
  onClose,
}: EventModalProps) {
  const { upsertEvent, deleteEvent } = useAppData();
  const isNew = !event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [memo, setMemo] = useState(event?.memo ?? "");
  const [kind, setKind] = useState<EventKind>(event?.kind ?? defaultKind);
  const [startStr, setStartStr] = useState(
    minutesToInput(event?.startMin ?? defaultStartMin),
  );
  const [endStr, setEndStr] = useState(
    minutesToInput(
      event?.endMin ?? (event?.startMin ?? defaultStartMin) + 60,
    ),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    let startMin: number | undefined;
    let endMin: number | undefined;
    if (kind === "timed") {
      const s = inputToMinutes(startStr);
      const e = inputToMinutes(endStr);
      if (s === null || e === null || e <= s) return;
      startMin = s;
      endMin = e;
    }
    const now = new Date().toISOString();
    upsertEvent({
      id: event?.id ?? crypto.randomUUID(),
      title: trimmed,
      memo: memo.trim() || undefined,
      date: dateKey,
      kind,
      startMin,
      endMin,
      createdAt: event?.createdAt ?? now,
    });
    onClose();
  };

  const remove = () => {
    if (!event) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteEvent(event.id);
    onClose();
  };

  return (
    <Modal title={isNew ? "予定を追加" : "予定を編集"} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            タイトル <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
            autoFocus
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            メモ（任意）
          </span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
          />
        </label>
        <fieldset className="text-sm">
          <legend className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">
            種類
          </legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={kind === "allDay"}
                onChange={() => setKind("allDay")}
              />
              終日
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={kind === "timed"}
                onChange={() => setKind("timed")}
              />
              時刻付き
            </label>
          </div>
        </fieldset>
        {kind === "timed" ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                開始
              </span>
              <input
                type="time"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                終了
              </span>
              <input
                type="time"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950"
              />
            </label>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={!title.trim()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            保存
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            キャンセル
          </button>
          {!isNew ? (
            <button
              type="button"
              onClick={remove}
              className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:text-red-400"
            >
              {confirmDelete ? "本当に削除" : "削除"}
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
