"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import {
  computeManipulatedRange,
  currentMinutesOfDay,
  eventTimelineColorClass,
  formatMinutesRange,
  minutesFromTimelineY,
  normalizeCreateRange,
  TIMELINE_DAY_END_MIN,
  TIMELINE_DEFAULT_DURATION_MIN,
  TIMELINE_SNAP_MINUTES,
  type EventManipMode,
} from "@/lib/day-schedule";
import {
  isToday,
  layoutDayEvents,
  toTimedForLayout,
  type PlacedEvent,
} from "@/lib/calendar";
import { isMultiDayEvent } from "@/lib/event-span";
import type { CalendarEvent } from "@/lib/types";

const HOUR_PX = 48;
const DAY_HEIGHT = 24 * HOUR_PX;
const RESIZE_HANDLE_PX = 12;
const DRAG_THRESHOLD_PX = 4;
const MIN_BLOCK_HEIGHT_PX = 28;

type CreateDragState = {
  pointerId: number;
  startMin: number;
  currentMin: number;
};

type EventDragState = {
  mode: EventManipMode;
  pointerId: number;
  eventId: string;
  originStartMin: number;
  originEndMin: number;
  grabOffsetMin: number;
  pointerStartClientY: number;
  currentStartMin: number;
  currentEndMin: number;
};

type DayScheduleTimelineProps = {
  date: Date;
  events: CalendarEvent[];
  scrollRef: RefObject<HTMLDivElement | null>;
  onCreateRange: (startMin: number, endMin: number) => void;
  onCreateAllDay: () => void;
  onEdit: (id: string) => void;
  onUpdateRange: (id: string, startMin: number, endMin: number) => void;
};

function pointerMinFromGrid(
  clientY: number,
  grid: HTMLDivElement,
): number {
  const rect = grid.getBoundingClientRect();
  const y = Math.min(rect.height, Math.max(0, clientY - rect.top));
  return minutesFromTimelineY(y, HOUR_PX);
}

function detectManipMode(
  localY: number,
  blockHeight: number,
): EventManipMode {
  // 短いブロックは中央を移動優先（端だけがリサイズ）
  const handle = Math.min(
    RESIZE_HANDLE_PX,
    Math.max(6, Math.floor(blockHeight / 4)),
  );
  if (localY <= handle) return "resize-start";
  if (localY >= blockHeight - handle) return "resize-end";
  return "move";
}

function TimelineEventBlock({
  ev,
  dragging,
  draggable,
  onEdit,
  onInteractStart,
}: {
  ev: PlacedEvent;
  dragging: boolean;
  draggable: boolean;
  onEdit: (id: string) => void;
  onInteractStart: (
    e: ReactPointerEvent<HTMLDivElement>,
    mode: EventManipMode,
  ) => void;
}) {
  const top = (ev.startMin / 60) * HOUR_PX;
  const height = Math.max(
    ((ev.endMin - ev.startMin) / 60) * HOUR_PX,
    MIN_BLOCK_HEIGHT_PX,
  );
  const widthPct = 100 / ev.laneCount;
  const leftPct = (ev.lane / ev.laneCount) * 100;
  const colorClass = eventTimelineColorClass(ev.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(ev.id);
        }
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.button !== 0) return;
        if (!draggable) {
          onEdit(ev.id);
          return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const localY = e.clientY - rect.top;
        onInteractStart(e, detectManipMode(localY, rect.height));
      }}
      className={`absolute box-border overflow-hidden rounded-r border border-zinc-200/80 px-1.5 py-0.5 text-left shadow-sm touch-none select-none ${colorClass} ${
        dragging
          ? "z-40 cursor-grabbing shadow-md ring-2 ring-blue-400/60"
          : draggable
            ? "z-20 cursor-grab hover:brightness-[0.98]"
            : "z-20 cursor-pointer hover:brightness-[0.98]"
      }`}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
      title={
        draggable
          ? undefined
          : "複数日の予定はクリックで編集（ドラッグ変更は単日の時刻付きのみ）"
      }
    >
      {draggable ? (
        <>
          <div
            className="absolute inset-x-0 top-0 z-10 flex h-3 cursor-ns-resize items-start justify-center"
            aria-hidden
          >
            <span className="mt-0.5 h-0.5 w-8 rounded-full bg-black/25" />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex h-3 cursor-ns-resize items-end justify-center"
            aria-hidden
          >
            <span className="mb-0.5 h-0.5 w-8 rounded-full bg-black/25" />
          </div>
        </>
      ) : null}
      <div className="pointer-events-none truncate text-[11px] leading-tight font-semibold">
        {ev.title}
      </div>
      {height >= 36 ? (
        <div className="pointer-events-none truncate text-[10px] leading-tight opacity-80">
          {formatMinutesRange(ev.startMin, ev.endMin)}
        </div>
      ) : null}
    </div>
  );
}

export function DayScheduleTimeline({
  date,
  events,
  scrollRef,
  onCreateRange,
  onCreateAllDay,
  onEdit,
  onUpdateRange,
}: DayScheduleTimelineProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const createDragRef = useRef<CreateDragState | null>(null);
  const eventDragRef = useRef<EventDragState | null>(null);
  const [createDrag, setCreateDrag] = useState<CreateDragState | null>(null);
  const [eventDrag, setEventDrag] = useState<EventDragState | null>(null);
  const [nowMin, setNowMin] = useState(() => currentMinutesOfDay());

  const timed = useMemo(() => toTimedForLayout(events), [events]);
  const placed = useMemo(() => layoutDayEvents(timed), [timed]);
  const allDay = events.filter((e) => e.kind === "allDay");
  const showNowLine = isToday(date);
  const eventById = useMemo(() => {
    const map = new Map<string, CalendarEvent>();
    for (const e of events) map.set(e.id, e);
    return map;
  }, [events]);

  const displayed = useMemo(() => {
    if (!eventDrag) return placed;
    return placed.map((ev) => {
      if (ev.id !== eventDrag.eventId) return ev;
      return {
        ...ev,
        startMin: eventDrag.currentStartMin,
        endMin: eventDrag.currentEndMin,
      };
    });
  }, [placed, eventDrag]);

  useEffect(() => {
    if (!showNowLine) return;
    const id = window.setInterval(
      () => setNowMin(currentMinutesOfDay()),
      60_000,
    );
    return () => clearInterval(id);
  }, [showNowLine]);

  const finishCreateDrag = useCallback(
    (state: CreateDragState) => {
      const range = normalizeCreateRange(state.startMin, state.currentMin);
      const dragged =
        Math.abs(state.currentMin - state.startMin) >= TIMELINE_SNAP_MINUTES;
      if (!dragged) {
        onCreateRange(
          range.startMin,
          Math.min(
            TIMELINE_DAY_END_MIN,
            range.startMin + TIMELINE_DEFAULT_DURATION_MIN,
          ),
        );
      } else {
        onCreateRange(range.startMin, range.endMin);
      }
    },
    [onCreateRange],
  );

  const finishEventDrag = useCallback(
    (state: EventDragState, clientY: number) => {
      const movedPx = Math.abs(clientY - state.pointerStartClientY);
      const changed =
        state.currentStartMin !== state.originStartMin ||
        state.currentEndMin !== state.originEndMin;
      if (movedPx < DRAG_THRESHOLD_PX && !changed) {
        onEdit(state.eventId);
      } else if (changed) {
        onUpdateRange(
          state.eventId,
          state.currentStartMin,
          state.currentEndMin,
        );
      }
    },
    [onEdit, onUpdateRange],
  );

  const isCreating = createDrag !== null;
  const isEventDragging = eventDrag !== null;

  useEffect(() => {
    if (!isCreating) return;

    const onMove = (e: PointerEvent) => {
      const d = createDragRef.current;
      if (!d || e.pointerId !== d.pointerId || !gridRef.current) return;
      const next = {
        ...d,
        currentMin: pointerMinFromGrid(e.clientY, gridRef.current),
      };
      createDragRef.current = next;
      setCreateDrag(next);
    };

    const onUp = (e: PointerEvent) => {
      const d = createDragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      finishCreateDrag(d);
      createDragRef.current = null;
      setCreateDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isCreating, finishCreateDrag]);

  useEffect(() => {
    if (!isEventDragging) return;

    const onMove = (e: PointerEvent) => {
      const d = eventDragRef.current;
      if (!d || e.pointerId !== d.pointerId || !gridRef.current) return;
      const pointerMin = pointerMinFromGrid(e.clientY, gridRef.current);
      const range = computeManipulatedRange(
        d.mode,
        pointerMin,
        d.originStartMin,
        d.originEndMin,
        d.grabOffsetMin,
      );
      const next = {
        ...d,
        currentStartMin: range.startMin,
        currentEndMin: range.endMin,
      };
      eventDragRef.current = next;
      setEventDrag(next);
    };

    const onUp = (e: PointerEvent) => {
      const d = eventDragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      finishEventDrag(d, e.clientY);
      eventDragRef.current = null;
      setEventDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isEventDragging, finishEventDrag]);

  const createPreview = useMemo(() => {
    if (!createDrag) return null;
    return normalizeCreateRange(createDrag.startMin, createDrag.currentMin);
  }, [createDrag]);

  const onGridPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !gridRef.current || eventDragRef.current) return;
    const startMin = pointerMinFromGrid(e.clientY, gridRef.current);
    const next = {
      pointerId: e.pointerId,
      startMin,
      currentMin: startMin,
    };
    createDragRef.current = next;
    setCreateDrag(next);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onEventInteractStart = (
    e: ReactPointerEvent<HTMLDivElement>,
    ev: PlacedEvent,
    mode: EventManipMode,
  ) => {
    if (!gridRef.current) return;
    const pointerMin = pointerMinFromGrid(e.clientY, gridRef.current);
    createDragRef.current = null;
    setCreateDrag(null);
    const next: EventDragState = {
      mode,
      pointerId: e.pointerId,
      eventId: ev.id,
      originStartMin: ev.startMin,
      originEndMin: ev.endMin,
      grabOffsetMin: pointerMin - ev.startMin,
      pointerStartClientY: e.clientY,
      currentStartMin: ev.startMin,
      currentEndMin: ev.endMin,
    };
    eventDragRef.current = next;
    setEventDrag(next);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    <div
      ref={scrollRef}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
    >
      <div className="shrink-0 border-b border-zinc-200 bg-zinc-50/80 px-2 py-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-black/50">
            終日
          </span>
          <button
            type="button"
            onClick={onCreateAllDay}
            className="rounded-md border border-dashed border-zinc-300 bg-white px-2 py-0.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
          >
            + 予定
          </button>
        </div>
        {allDay.length === 0 ? (
          <button
            type="button"
            onClick={onCreateAllDay}
            className="w-full rounded-md border border-dashed border-zinc-200 bg-white px-2 py-2 text-left text-sm text-black/45 hover:border-zinc-300 hover:bg-zinc-50"
          >
            終日の予定を追加
          </button>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {allDay.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => onEdit(ev.id)}
                  className="max-w-full truncate rounded-md border border-blue-200 bg-blue-100 px-2 py-1 text-left text-sm font-medium text-blue-900 hover:bg-blue-200"
                >
                  {ev.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <div
          className="flex w-11 shrink-0 flex-col border-r border-zinc-200 bg-white"
          style={{ height: DAY_HEIGHT }}
        >
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="relative shrink-0 pr-1.5 text-right text-xs text-black/55"
              style={{ height: HOUR_PX }}
            >
              <span className="absolute -top-2 right-1.5 tabular-nums">
                {h === 0 ? "" : `${h}:00`}
              </span>
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          className={`relative min-w-0 flex-1 touch-none select-none bg-white ${
            eventDrag ? "cursor-grabbing" : "cursor-crosshair"
          }`}
          style={{ height: DAY_HEIGHT }}
          onPointerDown={onGridPointerDown}
          role="grid"
          aria-label="時間割。空きをドラッグで追加、予定をドラッグで移動、上下端で時間変更"
        >
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="pointer-events-none absolute right-0 left-0">
              <div
                className="absolute right-0 left-0 border-t border-zinc-200"
                style={{ top: h * HOUR_PX, height: HOUR_PX }}
              />
              <div
                className="absolute right-0 left-0 border-t border-dashed border-zinc-100"
                style={{ top: h * HOUR_PX + HOUR_PX / 2 }}
              />
            </div>
          ))}

          {showNowLine ? (
            <div
              className="pointer-events-none absolute right-0 left-0 z-30 flex items-center"
              style={{ top: (nowMin / 60) * HOUR_PX }}
              aria-hidden
            >
              <span className="-ml-[5px] h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
              <span className="h-[2px] flex-1 bg-red-500" />
            </div>
          ) : null}

          {createPreview ? (
            <div
              className="pointer-events-none absolute right-1 left-1 z-10 rounded-md border-2 border-blue-500 bg-blue-400/25"
              style={{
                top: (createPreview.startMin / 60) * HOUR_PX,
                height: Math.max(
                  ((createPreview.endMin - createPreview.startMin) / 60) *
                    HOUR_PX,
                  4,
                ),
              }}
            >
              <span className="absolute top-0.5 left-1.5 text-xs font-semibold text-blue-800">
                {formatMinutesRange(
                  createPreview.startMin,
                  createPreview.endMin,
                )}
              </span>
            </div>
          ) : null}

          {displayed.map((ev) => {
            const source = eventById.get(ev.id);
            const draggable = !source || !isMultiDayEvent(source);
            return (
              <TimelineEventBlock
                key={ev.id}
                ev={ev}
                dragging={eventDrag?.eventId === ev.id}
                draggable={draggable}
                onEdit={onEdit}
                onInteractStart={(e, mode) => onEventInteractStart(e, ev, mode)}
              />
            );
          })}
        </div>
      </div>

      <p className="shrink-0 border-t border-zinc-100 bg-zinc-50/50 px-2 py-1.5 text-center text-xs text-black/40">
        {TIMELINE_SNAP_MINUTES}分 · 空きをドラッグで追加 · 予定をドラッグで移動 ·
        上下端を引っ張って時間変更 · クリックで編集
      </p>
    </div>
  );
}

export { HOUR_PX as DAY_TIMELINE_HOUR_PX };
