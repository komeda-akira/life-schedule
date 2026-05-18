"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useAppData } from "@/components/AppDataProvider";
import { EventModal } from "@/components/EventModal";
import { ScopeCommentModal } from "@/components/ScopeCommentModal";
import {
  addDays,
  addYears,
  excerptComment,
  formatDayHeader,
  formatMonthHeader,
  formatWeekHeader,
  formatWeekRowLabel,
  getMonday,
  isSameDay,
  isToday,
  layoutDayEvents,
  startOfDay,
  toTimedForLayout,
  type PlacedEvent,
} from "@/lib/calendar";
import {
  formatDateKey,
  monthKey,
  weekKey,
  yearKey,
} from "@/lib/scope-keys";
import type { CalendarEvent, EventKind } from "@/lib/types";

const YEAR_MIN = 2016;
const YEAR_MAX = 2032;
const HOUR_PX = 48;
const DAY_HEIGHT = 24 * HOUR_PX;

/** ??????????????? */
const INITIAL_CURSOR = startOfDay(new Date(2025, 4, 21));

const PANE_HINTS = {
  year: "???????????????",
  month: "?????????????????",
  week: "?????????????????",
  day: "????????????????????",
} as const;

function NavChevron({
  dir,
  label,
  onClick,
}: {
  dir: "prev" | "next";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
    >
      <span className="text-base leading-none" aria-hidden>
        {dir === "prev" ? "\u2039" : "\u203A"}
      </span>
    </button>
  );
}

function selectClass(selected: boolean) {
  return selected
    ? "border border-zinc-400 bg-zinc-200/90 shadow-inner"
    : "border border-transparent bg-white hover:border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900";
}

function PaneHeader({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-zinc-200 bg-zinc-50/80 px-2 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        {title}
      </div>
      <p className="mt-0.5 text-center text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
        {hint}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function ScopeExcerpt({ text }: { text: string }) {
  const ex = excerptComment(text);
  if (!ex) return null;
  return (
    <p className="mt-0.5 truncate text-[10px] text-zinc-500 dark:text-zinc-400">
      {ex}
    </p>
  );
}

function ScopeLabelButton({
  children,
  onOpenScope,
  title,
  className,
}: {
  children: ReactNode;
  onOpenScope: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenScope();
      }}
      title={title}
      className={`font-semibold text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:text-blue-800 dark:text-zinc-100 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

type ScopeModalState = { key: string; heading: string } | null;
type EventDraft = {
  event: CalendarEvent | null;
  dateKey: string;
  defaultStartMin?: number;
  defaultKind?: EventKind;
};

function Connector() {
  return (
    <div
      className="pointer-events-none absolute top-1/2 right-0 z-10 hidden h-px w-4 -translate-y-1/2 translate-x-full bg-zinc-400 md:block"
      aria-hidden
    />
  );
}

function YearPane({
  cursor,
  comment,
  onSelectYear,
  onOpenYearScope,
}: {
  cursor: Date;
  comment: string;
  onSelectYear: (y: number) => void;
  onOpenYearScope: (y: number) => void;
}) {
  const years = useMemo(() => {
    const ys: number[] = [];
    for (let y = YEAR_MIN; y <= YEAR_MAX; y++) ys.push(y);
    return ys;
  }, []);
  const y = cursor.getFullYear();

  return (
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col border-r border-zinc-200 md:min-h-[520px] dark:border-zinc-700">
      <PaneHeader title="?" hint={PANE_HINTS.year} />
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <ul className="flex flex-col gap-1">
          {[...years].reverse().map((year) => {
            const selected = year === y;
            return (
              <li key={year} className="relative flex items-stretch gap-0.5">
                <button
                  type="button"
                  onClick={() => onSelectYear(year)}
                  className={`min-w-0 flex-1 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${selectClass(selected)}`}
                >
                  <ScopeLabelButton
                    onOpenScope={() => onOpenYearScope(year)}
                    title={`${year}??????????`}
                    className="text-sm no-underline hover:underline"
                  >
                    {year}
                  </ScopeLabelButton>
                  {selected && comment ? <ScopeExcerpt text={comment} /> : null}
                </button>
                {selected ? <Connector /> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function MonthPane({
  cursor,
  comment,
  onSelectMonth,
  onAddYear,
  onOpenScope,
}: {
  cursor: Date;
  comment: string;
  onSelectMonth: (monthIndex: number) => void;
  onAddYear: (delta: number) => void;
  onOpenScope: () => void;
}) {
  const selectedMonth = cursor.getMonth();

  return (
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col border-r border-zinc-200 md:min-h-[520px] dark:border-zinc-700">
      <PaneHeader title="?" hint={PANE_HINTS.month}>
        <div className="flex items-center justify-between gap-1">
          <NavChevron dir="prev" label="??" onClick={() => onAddYear(-1)} />
          <ScopeLabelButton
            onOpenScope={onOpenScope}
            title="????????????"
            className="text-xs"
          >
            {formatMonthHeader(cursor)}
          </ScopeLabelButton>
          <NavChevron dir="next" label="??" onClick={() => onAddYear(1)} />
        </div>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {comment ? (
          <div className="mb-2 rounded border border-dashed border-zinc-200 px-2 py-1 dark:border-zinc-700">
            <ScopeExcerpt text={comment} />
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 12 }, (_, i) => {
            const selected = i === selectedMonth;
            return (
              <li key={i} className="relative list-none">
                <button
                  type="button"
                  onClick={() => onSelectMonth(i)}
                  className={`w-full rounded-md px-1 py-2.5 text-center text-sm font-medium text-zinc-800 dark:text-zinc-200 ${selectClass(selected)}`}
                >
                  {i + 1}?
                </button>
                {selected ? <Connector /> : null}
              </li>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekPane({
  cursor,
  comment,
  onSelectDay,
  onAddWeek,
  onOpenScope,
}: {
  cursor: Date;
  comment: string;
  onSelectDay: (d: Date) => void;
  onAddWeek: (delta: number) => void;
  onOpenScope: () => void;
}) {
  const days = useMemo(() => {
    const monday = getMonday(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [cursor]);

  return (
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col border-r border-zinc-200 md:min-h-[520px] dark:border-zinc-700">
      <PaneHeader title="?" hint={PANE_HINTS.week}>
        <div className="flex items-center justify-between gap-1">
          <NavChevron dir="prev" label="??" onClick={() => onAddWeek(-1)} />
          <ScopeLabelButton
            onOpenScope={onOpenScope}
            title="????????????"
            className="text-xs"
          >
            {formatWeekHeader(cursor)}
          </ScopeLabelButton>
          <NavChevron dir="next" label="??" onClick={() => onAddWeek(1)} />
        </div>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {comment ? (
          <div className="mb-2 rounded border border-dashed border-zinc-200 px-2 py-1 dark:border-zinc-700">
            <ScopeExcerpt text={comment} />
          </div>
        ) : null}
        <ul className="flex flex-col gap-1">
          {days.map((d) => {
            const selected = isSameDay(d, cursor);
            return (
              <li key={formatDateKey(d)} className="relative">
                <button
                  type="button"
                  onClick={() => onSelectDay(startOfDay(d))}
                  className={`w-full rounded-md px-2.5 py-2 text-left text-sm font-medium text-zinc-800 dark:text-zinc-200 ${selectClass(selected)}`}
                >
                  {formatWeekRowLabel(d)}
                </button>
                {selected ? <Connector /> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function EventBlock({
  ev,
  onEdit,
}: {
  ev: PlacedEvent;
  onEdit: (id: string) => void;
}) {
  const top = (ev.startMin / 60) * HOUR_PX;
  const height = Math.max(((ev.endMin - ev.startMin) / 60) * HOUR_PX, 24);
  const widthPct = 100 / ev.laneCount;
  const leftPct = (ev.lane / ev.laneCount) * 100;
  const startH = Math.floor(ev.startMin / 60);
  const startM = ev.startMin % 60;
  const endH = Math.floor(ev.endMin / 60);
  const endM = ev.endMin % 60;
  const range = `${startH}:${startM.toString().padStart(2, "0")}\u2013${endH}:${endM.toString().padStart(2, "0")}`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(ev.id);
      }}
      className="absolute z-10 box-border overflow-hidden rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-left shadow-sm hover:ring-2 hover:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-900"
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
    >
      <div className="text-[11px] leading-tight font-semibold text-zinc-900 dark:text-zinc-50">
        {ev.title}
      </div>
      <div className="text-[10px] leading-tight text-zinc-600 dark:text-zinc-400">
        {range}
      </div>
    </button>
  );
}

function TimelineDay({
  events,
  onCreateTimed,
  onEdit,
  scrollRef,
}: {
  events: CalendarEvent[];
  onCreateTimed: (startMin: number) => void;
  onEdit: (id: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const timed = useMemo(() => toTimedForLayout(events), [events]);
  const placed = useMemo(() => layoutDayEvents(timed), [timed]);
  const allDay = events.filter((e) => e.kind === "allDay");

  return (
    <div
      ref={scrollRef}
      className="flex min-h-0 min-w-0 flex-1 overflow-y-auto"
    >
      <div className="flex w-full flex-col">
        <button
          type="button"
          onClick={() => onCreateTimed(-1)}
          className="border-b border-dashed border-zinc-200 px-3 py-2 text-left text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          <div className="font-medium text-zinc-700 dark:text-zinc-200">
            ??
          </div>
          {allDay.length === 0 ? (
            <span className="text-zinc-400">????????????</span>
          ) : (
            <span className="mt-0.5 block text-zinc-800 dark:text-zinc-200">
              {allDay.map((e) => e.title).join(" / ")}
            </span>
          )}
        </button>
        <div className="flex min-h-0 flex-1">
          <div
            className="flex w-11 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-700"
            style={{ height: DAY_HEIGHT }}
          >
            {Array.from({ length: 25 }, (_, h) => (
              <div
                key={h}
                className="shrink-0 pr-1.5 text-right text-[10px] leading-none text-zinc-500"
                style={{ height: HOUR_PX }}
              >
                {h}:00
              </div>
            ))}
          </div>
          <div
            className="relative min-w-0 flex-1 bg-white dark:bg-zinc-950"
            style={{ height: DAY_HEIGHT }}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-zinc-200 dark:border-zinc-700"
                style={{ top: h * HOUR_PX, height: HOUR_PX }}
              />
            ))}
            <button
              type="button"
              aria-label="??????????????????"
              className="absolute inset-0 z-0 cursor-crosshair rounded-none border-0 bg-transparent p-0"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const hour = Math.min(23, Math.max(0, Math.floor(y / HOUR_PX)));
                onCreateTimed(hour * 60);
              }}
            />
            {placed.map((ev) => (
              <EventBlock key={ev.id} ev={ev} onEdit={onEdit} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayPane({
  cursor,
  events,
  onAddDay,
  onCreateTimed,
  onEdit,
  scrollRef,
}: {
  cursor: Date;
  events: CalendarEvent[];
  onAddDay: (delta: number) => void;
  onCreateTimed: (startMin: number) => void;
  onEdit: (id: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col md:min-h-[520px]">
      <PaneHeader title="?" hint={PANE_HINTS.day}>
        <div className="flex items-center justify-between gap-1">
          <NavChevron dir="prev" label="??" onClick={() => onAddDay(-1)} />
          <span className="min-w-0 flex-1 text-center text-[11px] font-semibold text-zinc-800 sm:text-xs dark:text-zinc-100">
            {formatDayHeader(cursor)}
          </span>
          <NavChevron dir="next" label="??" onClick={() => onAddDay(1)} />
        </div>
      </PaneHeader>
      <TimelineDay
        events={events}
        onCreateTimed={onCreateTimed}
        onEdit={onEdit}
        scrollRef={scrollRef}
      />
    </div>
  );
}

export function CalendarPanes() {
  const { eventsForDate, getScopeComment } = useAppData();
  const [cursor, setCursor] = useState(INITIAL_CURSOR);
  const [mobileTab, setMobileTab] = useState(3);
  const [scopeModal, setScopeModal] = useState<ScopeModalState>(null);
  const [eventDraft, setEventDraft] = useState<EventDraft | null>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);

  const dateKey = formatDateKey(cursor);
  const dayEvents = eventsForDate(dateKey);

  const yComment = getScopeComment(yearKey(cursor.getFullYear()));
  const mComment = getScopeComment(monthKey(cursor));
  const wComment = getScopeComment(weekKey(cursor));

  useEffect(() => {
    if (!isToday(cursor)) return;
    const el = dayScrollRef.current;
    if (!el) return;
    const now = new Date();
    const min = now.getHours() * 60 + now.getMinutes();
    el.scrollTop = Math.max(0, (min / 60) * HOUR_PX - el.clientHeight / 3);
  }, [cursor, dateKey]);

  const openEvent = (draft: {
    dateKey?: string;
    event?: CalendarEvent | null;
    defaultStartMin?: number;
    defaultKind?: EventKind;
  }) => {
    setEventDraft({
      dateKey: draft.dateKey ?? dateKey,
      event: draft.event ?? null,
      defaultStartMin: draft.defaultStartMin,
      defaultKind: draft.defaultKind,
    });
  };

  const onEditEvent = (id: string) => {
    const ev = dayEvents.find((e) => e.id === id);
    if (ev) openEvent({ event: ev });
  };

  const onCreateTimed = (startMin: number) => {
    if (startMin < 0) {
      openEvent({ defaultKind: "allDay" });
      return;
    }
    openEvent({ defaultStartMin: startMin, defaultKind: "timed" });
  };

  const onSelectYear = (year: number) => {
    const d = new Date(cursor);
    d.setFullYear(year);
    setCursor(startOfDay(d));
  };

  const onSelectMonth = (monthIndex: number) => {
    const d = new Date(cursor);
    d.setMonth(monthIndex);
    setCursor(startOfDay(d));
  };

  const onSelectDay = (d: Date) => {
    setCursor(startOfDay(d));
    setMobileTab(3);
  };

  const openYearScope = (year: number) => {
    setScopeModal({
      key: yearKey(year),
      heading: `${year}?`,
    });
  };

  const board = (
    <>
      <YearPane
        cursor={cursor}
        comment={yComment}
        onSelectYear={onSelectYear}
        onOpenYearScope={openYearScope}
      />
      <MonthPane
        cursor={cursor}
        comment={mComment}
        onSelectMonth={onSelectMonth}
        onAddYear={(d) => setCursor(startOfDay(addYears(cursor, d)))}
        onOpenScope={() =>
          setScopeModal({
            key: monthKey(cursor),
            heading: `${cursor.getFullYear()}?${cursor.getMonth() + 1}?`,
          })
        }
      />
      <WeekPane
        cursor={cursor}
        comment={wComment}
        onSelectDay={onSelectDay}
        onAddWeek={(d) => setCursor(startOfDay(addDays(cursor, d * 7)))}
        onOpenScope={() =>
          setScopeModal({
            key: weekKey(cursor),
            heading: formatWeekHeader(cursor),
          })
        }
      />
      <DayPane
        cursor={cursor}
        events={dayEvents}
        onAddDay={(d) => setCursor(startOfDay(addDays(cursor, d)))}
        onCreateTimed={onCreateTimed}
        onEdit={onEditEvent}
        scrollRef={dayScrollRef}
      />
    </>
  );

  const tabs = ["?", "?", "?", "?"] as const;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex gap-1 border-b border-zinc-200 bg-zinc-100 p-1.5 md:hidden dark:border-zinc-800 dark:bg-zinc-950"
        role="tablist"
      >
        {tabs.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={mobileTab === i}
            className={`flex-1 rounded-md border px-2 py-2 text-xs font-medium ${
              mobileTab === i
                ? "border-zinc-400 bg-white text-zinc-900 shadow-sm"
                : "border-transparent text-zinc-600"
            }`}
            onClick={() => setMobileTab(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="hidden min-h-[480px] flex-1 md:flex md:flex-row">
        {board}
      </div>

      <div className="flex min-h-[420px] flex-1 flex-col md:hidden">
        {mobileTab === 0 ? (
          <YearPane
            cursor={cursor}
            comment={yComment}
            onSelectYear={onSelectYear}
            onOpenYearScope={openYearScope}
          />
        ) : null}
        {mobileTab === 1 ? (
          <MonthPane
            cursor={cursor}
            comment={mComment}
            onSelectMonth={onSelectMonth}
            onAddYear={(d) => setCursor(startOfDay(addYears(cursor, d)))}
            onOpenScope={() =>
              setScopeModal({
                key: monthKey(cursor),
                heading: `${cursor.getFullYear()}?${cursor.getMonth() + 1}?`,
              })
            }
          />
        ) : null}
        {mobileTab === 2 ? (
          <WeekPane
            cursor={cursor}
            comment={wComment}
            onSelectDay={onSelectDay}
            onAddWeek={(d) => setCursor(startOfDay(addDays(cursor, d * 7)))}
            onOpenScope={() =>
              setScopeModal({
                key: weekKey(cursor),
                heading: formatWeekHeader(cursor),
              })
            }
          />
        ) : null}
        {mobileTab === 3 ? (
          <DayPane
            cursor={cursor}
            events={dayEvents}
            onAddDay={(d) => setCursor(startOfDay(addDays(cursor, d)))}
            onCreateTimed={onCreateTimed}
            onEdit={onEditEvent}
            scrollRef={dayScrollRef}
          />
        ) : null}
      </div>

      {scopeModal ? (
        <ScopeCommentModal
          scopeKey={scopeModal.key}
          heading={scopeModal.heading}
          onClose={() => setScopeModal(null)}
        />
      ) : null}

      {eventDraft ? (
        <EventModal
          event={eventDraft.event}
          dateKey={eventDraft.dateKey}
          defaultStartMin={eventDraft.defaultStartMin}
          defaultKind={eventDraft.defaultKind}
          onClose={() => setEventDraft(null)}
        />
      ) : null}
    </div>
  );
}
