"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { useAppData, type EventEditScope } from "@/components/AppDataProvider";
import {
  defaultRecurrenceUntil,
  parseInstanceEventId,
  RECURRENCE_OPTIONS,
} from "@/lib/recurrence";
import type { CalendarEvent, EventKind, RecurrenceFreq } from "@/lib/types";

type EventModalProps = {
  event: CalendarEvent | null;
  dateKey: string;
  defaultStartMin?: number;
  defaultEndMin?: number;
  defaultKind?: EventKind;
  prefilledTitle?: string;
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
  defaultEndMin,
  defaultKind = "timed",
  prefilledTitle = "",
  onClose,
}: EventModalProps) {
  const { upsertEvent, deleteEvent } = useAppData();
  const isNew = !event;
  const instance = event ? parseInstanceEventId(event.id) : null;
  const isRecurringInstance = Boolean(instance);
  const isRecurringMaster = Boolean(event?.recurrence && !event.recurrenceId);

  const [title, setTitle] = useState(event?.title ?? prefilledTitle);
  const [memo, setMemo] = useState(event?.memo ?? "");
  const [kind, setKind] = useState<EventKind>(event?.kind ?? defaultKind);
  const [startStr, setStartStr] = useState(
    minutesToInput(event?.startMin ?? defaultStartMin),
  );
  const [endStr, setEndStr] = useState(
    minutesToInput(
      event?.endMin ??
        defaultEndMin ??
        (event?.startMin ?? defaultStartMin) + 60,
    ),
  );
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFreq | "">(
    event?.recurrence?.freq ?? "",
  );
  const [recurrenceUntil, setRecurrenceUntil] = useState(
    event?.recurrence?.until ?? defaultRecurrenceUntil(dateKey),
  );
  const [editScope, setEditScope] = useState<EventEditScope>("all");
  const [deleteScope, setDeleteScope] = useState<EventEditScope>("all");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const showScopeChoice = isRecurringInstance || isRecurringMaster;

  const buildPayload = (): CalendarEvent | null => {
    const trimmed = title.trim();
    if (!trimmed) return null;
    let startMin: number | undefined;
    let endMin: number | undefined;
    if (kind === "timed") {
      const s = inputToMinutes(startStr);
      const e = inputToMinutes(endStr);
      if (s === null || e === null || e <= s) return null;
      startMin = s;
      endMin = e;
    }
    const now = new Date().toISOString();
    const base: CalendarEvent = {
      id: event?.id ?? crypto.randomUUID(),
      title: trimmed,
      memo: memo.trim() || undefined,
      date: isRecurringInstance ? (instance!.dateKey) : dateKey,
      kind,
      startMin,
      endMin,
      createdAt: event?.createdAt ?? now,
    };
    if (recurrenceFreq && !isRecurringInstance) {
      base.recurrence = {
        freq: recurrenceFreq,
        interval: 1,
        until: recurrenceUntil || undefined,
      };
    }
    return base;
  };

  const save = () => {
    const payload = buildPayload();
    if (!payload) return;
    const scope = showScopeChoice ? editScope : "all";
    upsertEvent(payload, scope);
    onClose();
  };

  const remove = () => {
    if (!event) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const scope = showScopeChoice ? deleteScope : "all";
    deleteEvent(event.id, scope);
    onClose();
  };

  return (
    <Modal title={isNew ? "予定を追加" : "予定を編集"} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-black">
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
          <span className="font-medium text-black">メモ（任意）</span>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <fieldset className="text-sm">
          <legend className="mb-1 font-medium text-black">種類</legend>
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
              <span className="font-medium text-black">開始</span>
              <input
                type="time"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-black">終了</span>
              <input
                type="time"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
          </div>
        ) : null}

        {!isRecurringInstance ? (
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="font-medium text-black">繰り返し</span>
              <select
                value={recurrenceFreq}
                onChange={(e) =>
                  setRecurrenceFreq(e.target.value as RecurrenceFreq | "")
                }
                className="rounded-lg border border-zinc-300 px-3 py-2"
              >
                {RECURRENCE_OPTIONS.map((o) => (
                  <option key={o.label} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            {recurrenceFreq ? (
              <label className="flex flex-col gap-1">
                <span className="font-medium text-black">繰り返し終了日</span>
                <input
                  type="date"
                  value={recurrenceUntil}
                  onChange={(e) => setRecurrenceUntil(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-3 py-2"
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {showScopeChoice && !isNew ? (
          <fieldset className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
            <legend className="px-1 font-medium text-black">
              繰り返し予定の編集範囲
            </legend>
            <div className="mt-1 flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={editScope === "single"}
                  onChange={() => setEditScope("single")}
                />
                この予定のみ
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={editScope === "all"}
                  onChange={() => setEditScope("all")}
                />
                すべての繰り返し
              </label>
            </div>
          </fieldset>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={!title.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
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
          {!isNew ? (
            <div className="ml-auto flex flex-col items-end gap-2">
              {showScopeChoice && confirmDelete ? (
                <div className="flex flex-col gap-1 text-xs">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={deleteScope === "single"}
                      onChange={() => setDeleteScope("single")}
                    />
                    この予定のみ削除
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={deleteScope === "all"}
                      onChange={() => setDeleteScope("all")}
                    />
                    すべて削除
                  </label>
                </div>
              ) : null}
              <button
                type="button"
                onClick={remove}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700"
              >
                {confirmDelete ? "本当に削除" : "削除"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
