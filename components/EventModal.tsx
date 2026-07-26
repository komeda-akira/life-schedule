"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { useAppData, type EventEditScope } from "@/components/AppDataProvider";
import {
  minutesToTimeInput,
  timeInputToMinutes,
} from "@/lib/day-schedule";
import {
  normalizeEventEndDate,
  resolveEventSpanBounds,
} from "@/lib/event-span";
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

export function EventModal({
  event,
  dateKey,
  defaultStartMin = 9 * 60,
  defaultEndMin,
  defaultKind = "timed",
  prefilledTitle = "",
  onClose,
}: EventModalProps) {
  const { data, upsertEvent, deleteEvent } = useAppData();
  const isNew = !event;
  const instance = event ? parseInstanceEventId(event.id) : null;
  const isRecurringInstance = Boolean(instance);
  const isRecurringMaster = Boolean(event?.recurrence && !event.recurrenceId);

  const masterRecurrence = useMemo(() => {
    if (!instance) return event?.recurrence;
    return data.events.find((e) => e.id === instance.masterId)?.recurrence;
  }, [data.events, event?.recurrence, instance]);

  const initialBounds = resolveEventSpanBounds(event, data.events, dateKey);

  const [title, setTitle] = useState(event?.title ?? prefilledTitle);
  const [memo, setMemo] = useState(event?.memo ?? "");
  const [kind, setKind] = useState<EventKind>(event?.kind ?? defaultKind);
  const [startDate, setStartDate] = useState(initialBounds.startDate);
  const [endDate, setEndDate] = useState(initialBounds.endDate);
  const [startStr, setStartStr] = useState(
    minutesToTimeInput(event?.startMin ?? defaultStartMin),
  );
  const [endStr, setEndStr] = useState(
    minutesToTimeInput(
      event?.endMin ??
        defaultEndMin ??
        (event?.startMin ?? defaultStartMin) + 60,
    ),
  );
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFreq | "">(
    event?.recurrence?.freq ?? masterRecurrence?.freq ?? "",
  );
  const [recurrenceUntil, setRecurrenceUntil] = useState(
    event?.recurrence?.until ??
      masterRecurrence?.until ??
      defaultRecurrenceUntil(dateKey),
  );
  const [editScope, setEditScope] = useState<EventEditScope>("single");
  const [deleteScope, setDeleteScope] = useState<EventEditScope>("single");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const bounds = resolveEventSpanBounds(event, data.events, dateKey);
    setStartDate(bounds.startDate);
    setEndDate(bounds.endDate);
  }, [event, data.events, dateKey]);

  // 時刻付きの繰り返しは各日の同時刻なので、終了日を開始日に揃える
  useEffect(() => {
    if (recurrenceFreq && kind === "timed" && endDate !== startDate) {
      setEndDate(startDate);
    }
  }, [recurrenceFreq, kind, startDate, endDate]);

  const showScopeChoice = isRecurringInstance || isRecurringMaster;
  const spanEditable = !isRecurringInstance || editScope === "all";
  const multiDayLocked = Boolean(recurrenceFreq) && kind === "timed";

  const timedTimesValid = useMemo(() => {
    if (kind !== "timed") return true;
    const s = timeInputToMinutes(startStr);
    const e = timeInputToMinutes(endStr);
    return s !== null && e !== null && e > s;
  }, [kind, startStr, endStr]);

  const canSave = Boolean(title.trim()) && timedTimesValid;

  const buildPayload = (): CalendarEvent | null => {
    const trimmed = title.trim();
    if (!trimmed) return null;
    let startMin: number | undefined;
    let endMin: number | undefined;
    if (kind === "timed") {
      const s = timeInputToMinutes(startStr);
      const e = timeInputToMinutes(endStr);
      if (s === null || e === null || e <= s) return null;
      startMin = s;
      endMin = e;
    }
    const now = new Date().toISOString();
    const eventStartDate =
      isRecurringInstance && editScope === "single"
        ? instance!.dateKey
        : startDate;
    // 時刻付き繰り返しは単日出現。終了日は付けない（繰り返し終了日は recurrence.until）
    const eventEndDate =
      isRecurringInstance && editScope === "single"
        ? undefined
        : multiDayLocked
          ? undefined
          : normalizeEventEndDate(startDate, endDate);

    const base: CalendarEvent = {
      id: event?.id ?? crypto.randomUUID(),
      title: trimmed,
      memo: memo.trim() || undefined,
      date: eventStartDate,
      endDate: eventEndDate,
      kind,
      startMin,
      endMin,
      createdAt: event?.createdAt ?? now,
    };
    const applyRecurrence =
      recurrenceFreq &&
      (!isRecurringInstance || editScope === "all");
    if (applyRecurrence) {
      base.recurrence = {
        freq: recurrenceFreq,
        interval: 1,
        until: recurrenceUntil || undefined,
      };
    }
    return base;
  };

  const save = () => {
    setSaveError(null);
    if (!title.trim()) {
      setSaveError("タイトルを入力してください");
      return;
    }
    if (kind === "timed" && !timedTimesValid) {
      setSaveError("終了時刻は開始時刻より後にしてください");
      return;
    }
    const payload = buildPayload();
    if (!payload) {
      setSaveError("入力内容を確認してください");
      return;
    }
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
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveError(null);
            }}
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

        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="font-medium text-black">開始日</span>
            <input
              type="date"
              value={startDate}
              disabled={!spanEditable}
              onChange={(e) => {
                const next = e.target.value;
                setStartDate(next);
                if (multiDayLocked || endDate < next) setEndDate(next);
              }}
              className="rounded-lg border border-zinc-300 px-3 py-2 disabled:bg-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium text-black">終了日</span>
            <input
              type="date"
              value={multiDayLocked ? startDate : endDate}
              min={startDate}
              disabled={!spanEditable || multiDayLocked}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 disabled:bg-zinc-100"
            />
          </label>
        </div>
        {multiDayLocked ? (
          <p className="text-[11px] leading-snug text-black/55">
            時刻付きの繰り返しは、毎日（または毎週など）同じ開始〜終了時刻で入ります。いつまで繰り返すかは下の「繰り返し終了日」で指定してください。
          </p>
        ) : endDate > startDate ? (
          <p className="text-[11px] leading-snug text-black/55">
            複数日の予定は期間中の各日に表示されます。時刻付きの場合、初日・最終日は時刻を表示し、途中の日は終日として表示します。
          </p>
        ) : null}

        <fieldset className="text-sm">
          <legend className="mb-1 font-medium text-black">種類</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={kind === "allDay"}
                onChange={() => {
                  setKind("allDay");
                  setSaveError(null);
                }}
              />
              終日
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                checked={kind === "timed"}
                onChange={() => {
                  setKind("timed");
                  setSaveError(null);
                }}
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
                onChange={(e) => {
                  setStartStr(e.target.value);
                  setSaveError(null);
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-black">終了</span>
              <input
                type="time"
                value={endStr}
                onChange={(e) => {
                  setEndStr(e.target.value);
                  setSaveError(null);
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>
          </div>
        ) : null}

        {!isRecurringInstance || editScope === "all" ? (
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

        {saveError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            {saveError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
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
