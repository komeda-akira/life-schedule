"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  computeManipulatedRange,
  eventTimelineColorClass,
  formatMinutesRange,
  minutesFromTimelineYWithOffset,
  normalizeCreateRange,
  TIMELINE_DAY_END_MIN,
  TIMELINE_DEFAULT_DURATION_MIN,
  TIMELINE_SNAP_MINUTES,
  type EventManipMode,
} from "@/lib/day-schedule";
import { isToday, layoutDayEvents, toTimedForLayout, type PlacedEvent } from "@/lib/calendar";
import { isMultiDayEvent } from "@/lib/event-span";
import {
  WEEKLY_SCHEDULE_START_HOUR,
  WEEKLY_TIMELINE_HEIGHT,
  WEEKLY_TIMELINE_ROW_PX,
  WEEKLY_TIMELINE_START_MIN,
} from "@/lib/weekly-worksheet";
import type { CalendarEvent } from "@/lib/types";

const RESIZE_HANDLE_PX = 10;
const DRAG_THRESHOLD_PX = 4;
const MIN_BLOCK_HEIGHT_PX = 22;

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

type WeekDayTimelineColumnProps = {
  date: Date;
  events: CalendarEvent[];
  onCreateRange: (startMin: number, endMin: number) => void;
  onUpdateRange: (id: string, startMin: number, endMin: number) => void;
  onEdit: (id: string) => void;
};

function pointerMinFromGrid(
  clientY: number,
  grid: HTMLDivElement,
): number {
  const rect = grid.getBoundingClientRect();
  const y = Math.min(rect.height, Math.max(0, clientY - rect.top));
  return minutesFromTimelineYWithOffset(
    y,
    WEEKLY_TIMELINE_ROW_PX,
    WEEKLY_SCHEDULE_START_HOUR,
  );
}

function detectManipMode(
  localY: number,
  blockHeight: number,
): EventManipMode {
  const handle = Math.min(
    RESIZE_HANDLE_PX,
    Math.max(5, Math.floor(blockHeight / 4)),
  );
  if (localY <= handle) return "resize-start";
  if (localY >= blockHeight - handle) return "resize-end";
  return "move";
}

function eventBlockStyle(startMin: number, endMin: number) {
  const visibleStart = Math.max(startMin, WEEKLY_TIMELINE_START_MIN);
  const visibleEnd = Math.min(endMin, TIMELINE_DAY_END_MIN);
  const top =
    ((visibleStart - WEEKLY_TIMELINE_START_MIN) / 60) * WEEKLY_TIMELINE_ROW_PX;
  const height = Math.max(
    ((visibleEnd - visibleStart) / 60) * WEEKLY_TIMELINE_ROW_PX,
    MIN_BLOCK_HEIGHT_PX,
  );
  return { top, height };
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
  const { top, height } = eventBlockStyle(ev.startMin, ev.endMin);
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
      className={`absolute box-border overflow-hidden rounded-r border border-zinc-200/80 px-0.5 py-px text-left shadow-sm touch-none select-none ${colorClass} ${
        dragging
          ? "z-40 cursor-grabbing shadow-md ring-2 ring-blue-400/60"
          : draggable
            ? "z-20 cursor-grab hover:brightness-[0.98]"
            : "z-20 cursor-pointer hover:brightness-[0.98]"
      }`}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 1px)`,
        width: `calc(${widthPct}% - 2px)`,
      }}
      title={
        draggable
          ? undefined
          : "複数日の予定はクリックで編集"
      }
    >
      {draggable ? (
        <>
          <div
            className="absolute inset-x-0 top-0 z-10 flex h-2.5 cursor-ns-resize items-start justify-center"
            aria-hidden
          >
            <span className="mt-px h-0.5 w-5 rounded-full bg-black/20" />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 z-10 flex h-2.5 cursor-ns-resize items-end justify-center"
            aria-hidden
          >
            <span className="mb-px h-0.5 w-5 rounded-full bg-black/20" />
          </div>
        </>
      ) : null}
      <div className="pointer-events-none truncate text-[11px] leading-tight font-semibold">
        {ev.title}
      </div>
      {height >= 30 ? (
        <div className="pointer-events-none truncate text-[10px] leading-tight opacity-80">
          {formatMinutesRange(ev.startMin, ev.endMin)}
        </div>
      ) : null}
    </div>
  );
}

export function WeekDayTimelineColumn({
  date,
  events,
  onCreateRange,
  onUpdateRange,
  onEdit,
}: WeekDayTimelineColumnProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const createDragRef = useRef<CreateDragState | null>(null);
  const eventDragRef = useRef<EventDragState | null>(null);
  const [createDrag, setCreateDrag] = useState<CreateDragState | null>(null);
  const [eventDrag, setEventDrag] = useState<EventDragState | null>(null);

  const timed = useMemo(
    () =>
      toTimedForLayout(events).filter(
        (e) => e.endMin > WEEKLY_TIMELINE_START_MIN,
      ),
    [events],
  );
  const placed = useMemo(() => layoutDayEvents(timed), [timed]);
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

  const nowTop = showNowLine
    ? ((new Date().getHours() * 60 +
        new Date().getMinutes() -
        WEEKLY_TIMELINE_START_MIN) /
        60) *
      WEEKLY_TIMELINE_ROW_PX
    : null;

  const hourRowCount = WEEKLY_TIMELINE_HEIGHT / WEEKLY_TIMELINE_ROW_PX;

  return (
    <div
      ref={gridRef}
      className={`relative h-full min-h-[20rem] w-full touch-none select-none bg-white ${
        eventDrag ? "cursor-grabbing" : "cursor-crosshair"
      }`}
      style={{ height: WEEKLY_TIMELINE_HEIGHT }}
      onPointerDown={onGridPointerDown}
      aria-label="週次スケジュール。ドラッグで追加・移動・上下端で時間変更"
    >
      {Array.from({ length: hourRowCount }, (_, h) => (
        <div
          key={h}
          className="pointer-events-none absolute right-0 left-0 border-t border-zinc-200"
          style={{ top: h * WEEKLY_TIMELINE_ROW_PX, height: WEEKLY_TIMELINE_ROW_PX }}
        >
          <div
            className="absolute right-0 left-0 top-1/2 border-t border-dashed border-zinc-100"
            aria-hidden
          />
        </div>
      ))}

      {nowTop != null && nowTop >= 0 && nowTop <= WEEKLY_TIMELINE_HEIGHT ? (
        <div
          className="pointer-events-none absolute right-0 left-0 z-30 h-px bg-red-500"
          style={{ top: nowTop }}
          aria-hidden
        />
      ) : null}

      {createPreview ? (
        <div
          className="pointer-events-none absolute right-0.5 left-0.5 z-10 rounded border-2 border-blue-500 bg-blue-400/25"
          style={eventBlockStyle(createPreview.startMin, createPreview.endMin)}
        />
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
  );
}
