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
  currentMinutesOfDay,
  eventTimelineColorClass,
  formatMinutesRange,
  TIMELINE_SNAP_MINUTES,
  type EventManipMode,
} from "@/lib/day-schedule";
import {
  autoScrollNearEdge,
  createDragPreviewRange,
  detectResizeOrMove,
  finishCreateDragRange,
  pointerMinutesFloor,
  pointerMinutesRound,
  scrollTimelineToMinutes,
  TIMELINE_DRAG_THRESHOLD_PX,
  updateEventDragFromPointer,
  type TimelineCreateDrag,
  type TimelineEventDrag,
  type TimelineRange,
} from "@/lib/timeline-interaction";
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
const MIN_BLOCK_HEIGHT_PX = 24;

type DayScheduleTimelineProps = {
  date: Date;
  events: CalendarEvent[];
  scrollRef: RefObject<HTMLDivElement | null>;
  /** クイック作成中のドラフト（ポップオーバー表示中もグリッドに残す） */
  createDraft?: TimelineRange | null;
  onCreateRange: (startMin: number, endMin: number) => void;
  onCreateAllDay: () => void;
  onEdit: (id: string) => void;
  onUpdateRange: (id: string, startMin: number, endMin: number) => void;
};

function gridMetrics(grid: HTMLDivElement) {
  const rect = grid.getBoundingClientRect();
  return { top: rect.top, height: rect.height };
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
  const top = (ev.startMin / 60) * HOUR_PX;
  const height = Math.max(
    ((ev.endMin - ev.startMin) / 60) * HOUR_PX,
    MIN_BLOCK_HEIGHT_PX,
  );
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
      className={`group absolute box-border overflow-hidden rounded-md px-1.5 py-0.5 text-left touch-none select-none ${colorClass} ${
        ghost
          ? "pointer-events-none z-10"
          : dragging
            ? "z-40 cursor-grabbing shadow-lg ring-2 ring-blue-500/40"
            : draggable
              ? "z-20 cursor-grab shadow-sm hover:brightness-[0.97]"
              : "z-20 cursor-pointer shadow-sm hover:brightness-[0.97]"
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
          : "複数日の予定はクリックで編集"
      }
    >
      {draggable && !ghost ? (
        <>
          <div
            className="absolute inset-x-0 top-0 z-10 h-2.5 cursor-ns-resize opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          >
            <span className="mx-auto mt-0.5 block h-0.5 w-7 rounded-full bg-current opacity-40" />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 z-10 h-2.5 cursor-ns-resize opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          >
            <span className="mx-auto mb-0.5 block h-0.5 w-7 rounded-full bg-current opacity-40" />
          </div>
        </>
      ) : null}
      <div className="pointer-events-none truncate text-[11px] leading-tight font-semibold">
        {ev.title}
      </div>
      {height >= 32 ? (
        <div className="pointer-events-none truncate text-[10px] leading-tight opacity-80">
          {formatMinutesRange(ev.startMin, ev.endMin)}
        </div>
      ) : null}
    </div>
  );
}

function DraftBlock({ range, label }: { range: TimelineRange; label?: string }) {
  return (
    <div
      className="pointer-events-none absolute right-1 left-1 z-[25] rounded-md border border-blue-500 bg-[#1a73e8]/85 px-1.5 py-0.5 text-white shadow-md"
      style={{
        top: (range.startMin / 60) * HOUR_PX,
        height: Math.max(
          ((range.endMin - range.startMin) / 60) * HOUR_PX,
          MIN_BLOCK_HEIGHT_PX,
        ),
      }}
    >
      <div className="truncate text-[11px] font-semibold leading-tight">
        {label ?? "（タイトルなし）"}
      </div>
      <div className="truncate text-[10px] leading-tight opacity-90">
        {formatMinutesRange(range.startMin, range.endMin)}
      </div>
    </div>
  );
}

export function DayScheduleTimeline({
  date,
  events,
  scrollRef,
  createDraft = null,
  onCreateRange,
  onCreateAllDay,
  onEdit,
  onUpdateRange,
}: DayScheduleTimelineProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const createDragRef = useRef<TimelineCreateDrag | null>(null);
  const eventDragRef = useRef<TimelineEventDrag | null>(null);
  const [createDrag, setCreateDrag] = useState<TimelineCreateDrag | null>(null);
  const [eventDrag, setEventDrag] = useState<TimelineEventDrag | null>(null);
  const [nowMin, setNowMin] = useState(() => currentMinutesOfDay());

  const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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

  useEffect(() => {
    if (!showNowLine) return;
    const id = window.setInterval(
      () => setNowMin(currentMinutesOfDay()),
      60_000,
    );
    return () => clearInterval(id);
  }, [showNowLine]);

  // 日付変更時に現在時刻付近へスクロール（Googleカレンダー同様）
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = showNowLine ? currentMinutesOfDay() : 8 * 60;
    requestAnimationFrame(() => {
      scrollTimelineToMinutes(el, target, HOUR_PX);
    });
  }, [dateKey, scrollRef, showNowLine]);

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
      const scrollEl = scrollRef.current;
      if (scrollEl) autoScrollNearEdge(scrollEl, e.clientY);

      const grid = gridRef.current;
      if (!grid) return;
      const { top, height } = gridMetrics(grid);

      const create = createDragRef.current;
      if (create && e.pointerId === create.pointerId) {
        const next: TimelineCreateDrag = {
          ...create,
          currentMin: pointerMinutesFloor(e.clientY, top, height, HOUR_PX),
        };
        createDragRef.current = next;
        setCreateDrag(next);
        return;
      }

      const drag = eventDragRef.current;
      if (drag && e.pointerId === drag.pointerId) {
        const pointerMin = pointerMinutesRound(e.clientY, top, height, HOUR_PX);
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
    scrollRef,
  ]);

  const liveCreatePreview = useMemo(() => {
    if (!createDrag) return null;
    return createDragPreviewRange(createDrag);
  }, [createDrag]);

  const onGridPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !gridRef.current || eventDragRef.current) return;
    if (createDraft) return;
    const { top, height } = gridMetrics(gridRef.current);
    const originMin = pointerMinutesFloor(e.clientY, top, height, HOUR_PX);
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
    const pointerMin = pointerMinutesRound(e.clientY, top, height, HOUR_PX);
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

  const draftToShow = liveCreatePreview ?? createDraft;

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
          className="flex w-12 shrink-0 flex-col border-r border-zinc-200 bg-white"
          style={{ height: DAY_HEIGHT }}
        >
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="relative shrink-0 pr-2 text-right text-[11px] text-black/50"
              style={{ height: HOUR_PX }}
            >
              <span className="absolute -top-2 right-2 tabular-nums">
                {h === 0 ? "" : `${h}:00`}
              </span>
            </div>
          ))}
        </div>

        <div
          ref={gridRef}
          className={`relative min-w-0 flex-1 touch-none select-none bg-white ${
            eventDrag
              ? eventDrag.mode === "move"
                ? "cursor-grabbing"
                : "cursor-ns-resize"
              : "cursor-default"
          }`}
          style={{ height: DAY_HEIGHT }}
          onPointerDown={onGridPointerDown}
          role="grid"
          aria-label="時間割。クリックまたはドラッグで予定を追加。予定をドラッグで移動、端で時間変更"
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
      </div>

      <p className="shrink-0 border-t border-zinc-100 bg-zinc-50/50 px-2 py-1.5 text-center text-xs text-black/40">
        {TIMELINE_SNAP_MINUTES}分単位 · 空きをクリック／ドラッグで追加 ·
        予定をドラッグで移動 · 上下端で時間変更 · Escでキャンセル
      </p>
    </div>
  );
}

export { HOUR_PX as DAY_TIMELINE_HOUR_PX };
