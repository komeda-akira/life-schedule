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
  minutesFromTimelineY,
  normalizeCreateRange,
  TIMELINE_DEFAULT_DURATION_MIN,
  TIMELINE_SNAP_MINUTES,
} from "@/lib/day-schedule";
import {
  isToday,
  layoutDayEvents,
  toTimedForLayout,
  type PlacedEvent,
} from "@/lib/calendar";
import type { CalendarEvent } from "@/lib/types";

const HOUR_PX = 48;
const DAY_HEIGHT = 24 * HOUR_PX;

type DragState = {
  pointerId: number;
  startMin: number;
  currentMin: number;
};

type DayScheduleTimelineProps = {
  date: Date;
  events: CalendarEvent[];
  scrollRef: RefObject<HTMLDivElement | null>;
  onCreateRange: (startMin: number, endMin: number) => void;
  onCreateAllDay: () => void;
  onEdit: (id: string) => void;
};

function TimelineEventBlock({
  ev,
  onEdit,
}: {
  ev: PlacedEvent;
  onEdit: (id: string) => void;
}) {
  const top = (ev.startMin / 60) * HOUR_PX;
  const height = Math.max(((ev.endMin - ev.startMin) / 60) * HOUR_PX, 22);
  const widthPct = 100 / ev.laneCount;
  const leftPct = (ev.lane / ev.laneCount) * 100;
  const colorClass = eventTimelineColorClass(ev.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(ev.id);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute z-20 box-border overflow-hidden rounded-r border border-zinc-200/80 px-1.5 py-0.5 text-left shadow-sm ${colorClass}`}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
    >
      <div className="truncate text-[11px] leading-tight font-semibold">
        {ev.title}
      </div>
      {height >= 36 ? (
        <div className="truncate text-[10px] leading-tight opacity-80">
          {formatMinutesRange(ev.startMin, ev.endMin)}
        </div>
      ) : null}
    </button>
  );
}

export function DayScheduleTimeline({
  date,
  events,
  scrollRef,
  onCreateRange,
  onCreateAllDay,
  onEdit,
}: DayScheduleTimelineProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [nowMin, setNowMin] = useState(() => currentMinutesOfDay());

  const timed = useMemo(() => toTimedForLayout(events), [events]);
  const placed = useMemo(() => layoutDayEvents(timed), [timed]);
  const allDay = events.filter((e) => e.kind === "allDay");
  const showNowLine = isToday(date);

  useEffect(() => {
    if (!showNowLine) return;
    const id = window.setInterval(
      () => setNowMin(currentMinutesOfDay()),
      60_000,
    );
    return () => clearInterval(id);
  }, [showNowLine]);

  const finishDrag = useCallback(
    (state: DragState) => {
      const range = normalizeCreateRange(state.startMin, state.currentMin);
      const dragged =
        Math.abs(state.currentMin - state.startMin) >= TIMELINE_SNAP_MINUTES;
      if (!dragged) {
        onCreateRange(
          range.startMin,
          Math.min(
            24 * 60,
            range.startMin + TIMELINE_DEFAULT_DURATION_MIN,
          ),
        );
      } else {
        onCreateRange(range.startMin, range.endMin);
      }
    },
    [onCreateRange],
  );

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId || !gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const y = Math.min(rect.height, Math.max(0, e.clientY - rect.top));
      setDrag((d) =>
        d
          ? {
              ...d,
              currentMin: minutesFromTimelineY(y, HOUR_PX),
            }
          : null,
      );
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== drag.pointerId) return;
      finishDrag(drag);
      setDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, finishDrag]);

  const preview = useMemo(() => {
    if (!drag) return null;
    return normalizeCreateRange(drag.startMin, drag.currentMin);
  }, [drag]);

  const onGridPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const startMin = minutesFromTimelineY(y, HOUR_PX);
    setDrag({
      pointerId: e.pointerId,
      startMin,
      currentMin: startMin,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  return (
    <div
      ref={scrollRef}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
    >
      <div className="shrink-0 border-b border-zinc-200 bg-zinc-50/80 px-2 py-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-black/50">
            終日
          </span>
          <button
            type="button"
            onClick={onCreateAllDay}
            className="rounded-md border border-dashed border-zinc-300 bg-white px-2 py-0.5 text-[11px] font-medium text-blue-700 hover:bg-blue-50"
          >
            + 予定
          </button>
        </div>
        {allDay.length === 0 ? (
          <button
            type="button"
            onClick={onCreateAllDay}
            className="w-full rounded-md border border-dashed border-zinc-200 bg-white px-2 py-2 text-left text-xs text-black/45 hover:border-zinc-300 hover:bg-zinc-50"
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
                  className="max-w-full truncate rounded-md border border-blue-200 bg-blue-100 px-2 py-1 text-left text-xs font-medium text-blue-900 hover:bg-blue-200"
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
              className="relative shrink-0 pr-1.5 text-right text-[10px] text-black/55"
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
          className="relative min-w-0 flex-1 cursor-crosshair touch-none select-none bg-white"
          style={{ height: DAY_HEIGHT }}
          onPointerDown={onGridPointerDown}
          role="grid"
          aria-label="時間割。ドラッグまたはクリックで予定を追加"
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

          {preview ? (
            <div
              className="pointer-events-none absolute right-1 left-1 z-10 rounded-md border-2 border-blue-500 bg-blue-400/25"
              style={{
                top: (preview.startMin / 60) * HOUR_PX,
                height: Math.max(
                  ((preview.endMin - preview.startMin) / 60) * HOUR_PX,
                  4,
                ),
              }}
            >
              <span className="absolute top-0.5 left-1.5 text-[10px] font-semibold text-blue-800">
                {formatMinutesRange(preview.startMin, preview.endMin)}
              </span>
            </div>
          ) : null}

          {placed.map((ev) => (
            <TimelineEventBlock key={ev.id} ev={ev} onEdit={onEdit} />
          ))}
        </div>
      </div>

      <p className="shrink-0 border-t border-zinc-100 bg-zinc-50/50 px-2 py-1.5 text-center text-[9px] text-black/40">
        {TIMELINE_SNAP_MINUTES}分単位 · クリックで1時間 · ドラッグで範囲指定
      </p>
    </div>
  );
}

export { HOUR_PX as DAY_TIMELINE_HOUR_PX };
