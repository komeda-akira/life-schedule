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
  eventTimelineColorClass,
  formatMinutesRange,
  TIMELINE_DAY_END_MIN,
  type EventManipMode,
} from "@/lib/day-schedule";
import {
  createDragPreviewRange,
  detectResizeOrMove,
  finishCreateDragRange,
  pointerMinutesFloor,
  pointerMinutesRound,
  TIMELINE_DRAG_THRESHOLD_PX,
  updateEventDragFromPointer,
  type TimelineCreateDrag,
  type TimelineEventDrag,
  type TimelineRange,
} from "@/lib/timeline-interaction";
import { isToday, layoutDayEvents, toTimedForLayout, type PlacedEvent } from "@/lib/calendar";
import { isMultiDayEvent } from "@/lib/event-span";
import {
  WEEKLY_SCHEDULE_START_HOUR,
  WEEKLY_TIMELINE_HEIGHT,
  WEEKLY_TIMELINE_ROW_PX,
  WEEKLY_TIMELINE_START_MIN,
} from "@/lib/weekly-worksheet";
import type { CalendarEvent } from "@/lib/types";

const MIN_BLOCK_HEIGHT_PX = 18;

type WeekDayTimelineColumnProps = {
  date: Date;
  events: CalendarEvent[];
  createDraft?: TimelineRange | null;
  onCreateRange: (startMin: number, endMin: number) => void;
  onUpdateRange: (id: string, startMin: number, endMin: number) => void;
  onEdit: (id: string) => void;
};

function gridMetrics(grid: HTMLDivElement) {
  const rect = grid.getBoundingClientRect();
  return { top: rect.top, height: rect.height };
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
  ghost,
  draggable,
  onEdit,
  onInteractStart,
}: {
  ev: PlacedEvent;
  dragging: boolean;
  ghost?: boolean;
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
  const colorClass = ghost
    ? "border border-blue-300 bg-blue-100/50 text-blue-900/50"
    : eventTimelineColorClass(ev.id);

  return (
    <div
      role="button"
      tabIndex={ghost ? -1 : 0}
      onKeyDown={(e) => {
        if (ghost) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(ev.id);
        }
      }}
      onPointerDown={(e) => {
        if (ghost) return;
        e.stopPropagation();
        if (e.button !== 0) return;
        if (!draggable) {
          onEdit(ev.id);
          return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const localY = e.clientY - rect.top;
        onInteractStart(e, detectResizeOrMove(localY, rect.height));
      }}
      className={`group absolute box-border overflow-hidden rounded-sm px-0.5 py-px text-left touch-none select-none ${colorClass} ${
        ghost
          ? "pointer-events-none z-10"
          : dragging
            ? "z-40 cursor-grabbing shadow-md ring-2 ring-blue-500/40"
            : draggable
              ? "z-20 cursor-grab shadow-sm hover:brightness-[0.97]"
              : "z-20 cursor-pointer shadow-sm"
      }`}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 1px)`,
        width: `calc(${widthPct}% - 2px)`,
      }}
    >
      {draggable && !ghost ? (
        <>
          <div
            className="absolute inset-x-0 top-0 z-10 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 z-10 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100"
            aria-hidden
          />
        </>
      ) : null}
      <div className="pointer-events-none truncate text-[11px] leading-tight font-semibold">
        {ev.title}
      </div>
      {height >= 28 ? (
        <div className="pointer-events-none truncate text-[10px] leading-tight opacity-80">
          {formatMinutesRange(ev.startMin, ev.endMin)}
        </div>
      ) : null}
    </div>
  );
}

function DraftBlock({ range }: { range: TimelineRange }) {
  return (
    <div
      className="pointer-events-none absolute right-0.5 left-0.5 z-[25] rounded-sm border border-blue-500 bg-[#1a73e8]/85 px-0.5 py-px text-white shadow"
      style={eventBlockStyle(range.startMin, range.endMin)}
    >
      <div className="truncate text-[10px] font-semibold leading-tight">
        （タイトルなし）
      </div>
      <div className="truncate text-[9px] leading-tight opacity-90">
        {formatMinutesRange(range.startMin, range.endMin)}
      </div>
    </div>
  );
}

export function WeekDayTimelineColumn({
  date,
  events,
  createDraft = null,
  onCreateRange,
  onUpdateRange,
  onEdit,
}: WeekDayTimelineColumnProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const createDragRef = useRef<TimelineCreateDrag | null>(null);
  const eventDragRef = useRef<TimelineEventDrag | null>(null);
  const [createDrag, setCreateDrag] = useState<TimelineCreateDrag | null>(null);
  const [eventDrag, setEventDrag] = useState<TimelineEventDrag | null>(null);

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

  const ghostOrigin = useMemo(() => {
    if (!eventDrag || eventDrag.mode !== "move") return null;
    const ev = placed.find((e) => e.id === eventDrag.eventId);
    if (!ev) return null;
    return {
      ...ev,
      startMin: eventDrag.originStartMin,
      endMin: eventDrag.originEndMin,
    };
  }, [eventDrag, placed]);

  const cancelDrags = useCallback(() => {
    createDragRef.current = null;
    eventDragRef.current = null;
    setCreateDrag(null);
    setEventDrag(null);
  }, []);

  const finishCreateDrag = useCallback(
    (state: TimelineCreateDrag) => {
      const range = finishCreateDragRange(state);
      onCreateRange(range.startMin, range.endMin);
    },
    [onCreateRange],
  );

  const finishEventDrag = useCallback(
    (state: TimelineEventDrag, clientY: number) => {
      const movedPx = Math.abs(clientY - state.pointerStartClientY);
      const changed =
        state.currentStartMin !== state.originStartMin ||
        state.currentEndMin !== state.originEndMin;
      if (movedPx < TIMELINE_DRAG_THRESHOLD_PX && !changed) {
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
    if (!isCreating && !isEventDragging) return;

    const onMove = (e: PointerEvent) => {
      const grid = gridRef.current;
      if (!grid) return;
      const { top, height } = gridMetrics(grid);

      const create = createDragRef.current;
      if (create && e.pointerId === create.pointerId) {
        const next: TimelineCreateDrag = {
          ...create,
          currentMin: pointerMinutesFloor(
            e.clientY,
            top,
            height,
            WEEKLY_TIMELINE_ROW_PX,
            WEEKLY_SCHEDULE_START_HOUR,
          ),
        };
        createDragRef.current = next;
        setCreateDrag(next);
        return;
      }

      const drag = eventDragRef.current;
      if (drag && e.pointerId === drag.pointerId) {
        const pointerMin = pointerMinutesRound(
          e.clientY,
          top,
          height,
          WEEKLY_TIMELINE_ROW_PX,
          WEEKLY_SCHEDULE_START_HOUR,
        );
        const next = updateEventDragFromPointer(drag, pointerMin);
        eventDragRef.current = next;
        setEventDrag(next);
      }
    };

    const onUp = (e: PointerEvent) => {
      const create = createDragRef.current;
      if (create && e.pointerId === create.pointerId) {
        finishCreateDrag(create);
        createDragRef.current = null;
        setCreateDrag(null);
        return;
      }
      const drag = eventDragRef.current;
      if (drag && e.pointerId === drag.pointerId) {
        finishEventDrag(drag, e.clientY);
        eventDragRef.current = null;
        setEventDrag(null);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelDrags();
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [
    isCreating,
    isEventDragging,
    finishCreateDrag,
    finishEventDrag,
    cancelDrags,
  ]);

  const liveCreatePreview = useMemo(() => {
    if (!createDrag) return null;
    return createDragPreviewRange(createDrag);
  }, [createDrag]);

  const onGridPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !gridRef.current || eventDragRef.current) return;
    if (createDraft) return;
    const { top, height } = gridMetrics(gridRef.current);
    const originMin = pointerMinutesFloor(
      e.clientY,
      top,
      height,
      WEEKLY_TIMELINE_ROW_PX,
      WEEKLY_SCHEDULE_START_HOUR,
    );
    const next: TimelineCreateDrag = {
      pointerId: e.pointerId,
      originMin,
      currentMin: originMin,
      pointerStartClientY: e.clientY,
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
    const { top, height } = gridMetrics(gridRef.current);
    const pointerMin = pointerMinutesRound(
      e.clientY,
      top,
      height,
      WEEKLY_TIMELINE_ROW_PX,
      WEEKLY_SCHEDULE_START_HOUR,
    );
    createDragRef.current = null;
    setCreateDrag(null);
    const next: TimelineEventDrag = {
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
  const draftToShow = liveCreatePreview ?? createDraft;

  return (
    <div
      ref={gridRef}
      className={`relative h-full min-h-[20rem] w-full touch-none select-none bg-white ${
        eventDrag
          ? eventDrag.mode === "move"
            ? "cursor-grabbing"
            : "cursor-ns-resize"
          : "cursor-default"
      }`}
      style={{ height: WEEKLY_TIMELINE_HEIGHT }}
      onPointerDown={onGridPointerDown}
      aria-label="週次スケジュール。クリック／ドラッグで追加、予定をドラッグで移動"
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

      {ghostOrigin ? (
        <TimelineEventBlock
          ev={ghostOrigin}
          dragging={false}
          ghost
          draggable={false}
          onEdit={onEdit}
          onInteractStart={() => {}}
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

      {draftToShow ? <DraftBlock range={draftToShow} /> : null}
    </div>
  );
}
