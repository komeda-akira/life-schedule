"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useAppData } from "@/components/AppDataProvider";
import { EventModal } from "@/components/EventModal";
import { MidLongTermPlanModal } from "@/components/MidLongTermPlanModal";
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
  listYearsChronological,
  startOfDay,
  toTimedForLayout,
  weekdayTextClass,
  YEAR_PANE_MAX,
  YEAR_PANE_MIN,
  type PlacedEvent,
} from "@/lib/calendar";
import {
  formatDateKey,
  monthKey,
  weekKey,
  yearKey,
} from "@/lib/scope-keys";
import {
  LABEL_ADD_ALL_DAY,
  LABEL_ADD_TIMED,
  LABEL_ALL_DAY,
  LABEL_NEXT_DAY,
  LABEL_NEXT_WEEK,
  LABEL_NEXT_YEAR,
  LABEL_PREV_DAY,
  LABEL_PREV_WEEK,
  LABEL_PREV_YEAR,
  MOBILE_TABS,
  monthLabel,
  MONTH_PANE_TITLE,
  PANE_HINTS,
  SCOPE_COMMENT_MONTH,
  SCOPE_COMMENT_WEEK,
  scopeCommentTitle,
  scopeHeadingYear,
  scopeHeadingYearMonth,
  WEEK_PANE_TITLE,
  DAY_PANE_TITLE,
  OPEN_MLTP_HINT,
  YEAR_PANE_TITLE,
  YEAR_START_LABEL,
} from "@/lib/pane-labels";
import { yearPlanSummaryExcerpt } from "@/lib/mid-long-term-plan";
import type { CalendarEvent, EventKind } from "@/lib/types";

const HOUR_PX = 48;
const DAY_HEIGHT = 24 * HOUR_PX;

const INITIAL_CURSOR = startOfDay(new Date(2026, 4, 21));

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
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-300 bg-white text-black/80 hover:bg-zinc-50"
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
    : "border border-transparent bg-white hover:border-zinc-200 hover:bg-zinc-50";
}

function PaneHeader({
  title,
  hint,
  children,
  onTitleClick,
  titleClickHint,
}: {
  title: string;
  hint?: string;
  children?: ReactNode;
  onTitleClick?: () => void;
  titleClickHint?: string;
}) {
  return (
    <div className="border-b border-zinc-200 bg-white px-2 py-2">
      {onTitleClick ? (
        <button
          type="button"
          onClick={onTitleClick}
          title={titleClickHint}
          className="mx-auto block w-full text-center text-sm font-semibold text-black underline decoration-zinc-400 underline-offset-2 hover:bg-zinc-50"
        >
          {title}
        </button>
      ) : (
        <div className="text-center text-sm font-semibold text-black">
          {title}
        </div>
      )}
      {hint ? (
        <p className="mt-0.5 text-center text-[10px] leading-snug text-black/60">
          {hint}
        </p>
      ) : null}
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function ScopeExcerpt({ text }: { text: string }) {
  const ex = excerptComment(text);
  if (!ex) return null;
  return (
    <p className="mt-0.5 truncate text-[10px] text-black/60">
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
      className={`font-semibold text-black underline decoration-zinc-400 underline-offset-2 hover:text-black ${className ?? ""}`}
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
  planYearExcerpt,
  onSelectYear,
  onOpenYearScope,
  onOpenPlan,
}: {
  cursor: Date;
  comment: string;
  planYearExcerpt: (year: number) => string;
  onSelectYear: (y: number) => void;
  onOpenYearScope: (y: number) => void;
  onOpenPlan: () => void;
}) {
  const years = useMemo(
    () => listYearsChronological(YEAR_PANE_MIN, YEAR_PANE_MAX),
    [],
  );
  const y = cursor.getFullYear();

  return (
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col border-r border-zinc-200 md:min-h-[520px]">
      <PaneHeader
        title={YEAR_PANE_TITLE}
        hint={PANE_HINTS.year}
        onTitleClick={onOpenPlan}
        titleClickHint={OPEN_MLTP_HINT}
      />
      <div className="px-2 py-2">
        <ul className="flex flex-col gap-1">
          {years.map((year) => {
            const selected = year === y;
            const isStart = year === YEAR_PANE_MIN;
            const summary = planYearExcerpt(year);
            return (
              <li
                key={year}
                data-year={year}
                className="relative flex items-stretch gap-0.5"
              >
                <button
                  type="button"
                  onClick={() => onSelectYear(year)}
                  className={`min-w-0 flex-1 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${selectClass(selected)}`}
                >
                  <ScopeLabelButton
                    onOpenScope={() => onOpenYearScope(year)}
                    title={scopeCommentTitle(year)}
                    className="text-sm no-underline hover:underline"
                  >
                    <span className="flex min-w-0 items-baseline gap-1.5">
                      <span className="shrink-0 tabular-nums">{year}</span>
                      {summary ? (
                        <span className="min-w-0 truncate text-[10px] font-normal text-black/60 no-underline">
                          {summary}
                        </span>
                      ) : null}
                      {isStart ? (
                        <span className="shrink-0 text-[10px] font-normal text-black/60">
                          {YEAR_START_LABEL}
                        </span>
                      ) : null}
                    </span>
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
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col border-r border-zinc-200 md:min-h-[520px]">
      <PaneHeader title={MONTH_PANE_TITLE} hint={PANE_HINTS.month}>
        <div className="flex items-center justify-between gap-1">
          <NavChevron dir="prev" label={LABEL_PREV_YEAR} onClick={() => onAddYear(-1)} />
          <ScopeLabelButton
            onOpenScope={onOpenScope}
            title={SCOPE_COMMENT_MONTH}
            className="text-xs"
          >
            {formatMonthHeader(cursor)}
          </ScopeLabelButton>
          <NavChevron dir="next" label={LABEL_NEXT_YEAR} onClick={() => onAddYear(1)} />
        </div>
      </PaneHeader>
      <div className="p-2">
        {comment ? (
          <div className="mb-2 rounded border border-dashed border-zinc-200 px-2 py-1">
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
                  className={`w-full rounded-md px-1 py-2.5 text-center text-sm font-medium text-black ${selectClass(selected)}`}
                >
                  {monthLabel(i)}
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
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col border-r border-zinc-200 md:min-h-[520px]">
      <PaneHeader title={WEEK_PANE_TITLE} hint={PANE_HINTS.week}>
        <div className="flex items-center justify-between gap-1">
          <NavChevron dir="prev" label={LABEL_PREV_WEEK} onClick={() => onAddWeek(-1)} />
          <ScopeLabelButton
            onOpenScope={onOpenScope}
            title={SCOPE_COMMENT_WEEK}
            className="text-xs"
          >
            {formatWeekHeader(cursor)}
          </ScopeLabelButton>
          <NavChevron dir="next" label={LABEL_NEXT_WEEK} onClick={() => onAddWeek(1)} />
        </div>
      </PaneHeader>
      <div className="px-2 py-2">
        {comment ? (
          <div className="mb-2 rounded border border-dashed border-zinc-200 px-2 py-1">
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
                  className={`w-full rounded-md px-2.5 py-2 text-left text-sm font-medium ${weekdayTextClass(d)} ${selectClass(selected)}`}
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
      className="absolute z-10 box-border overflow-hidden rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-left shadow-sm hover:ring-2 hover:ring-zinc-400"
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
    >
      <div className="text-[11px] leading-tight font-semibold text-black">
        {ev.title}
      </div>
      <div className="text-[10px] leading-tight text-black/80">
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
          className="border-b border-dashed border-zinc-200 px-3 py-2 text-left text-xs text-black/80 hover:bg-zinc-50"
        >
          <div className="font-medium text-black">
            {LABEL_ALL_DAY}
          </div>
          {allDay.length === 0 ? (
            <span className="text-black/50">{LABEL_ADD_ALL_DAY}</span>
          ) : (
            <span className="mt-0.5 block text-black">
              {allDay.map((e) => e.title).join(" / ")}
            </span>
          )}
        </button>
        <div className="flex min-h-0 flex-1">
          <div
            className="flex w-11 shrink-0 flex-col border-r border-zinc-200"
            style={{ height: DAY_HEIGHT }}
          >
            {Array.from({ length: 25 }, (_, h) => (
              <div
                key={h}
                className="shrink-0 pr-1.5 text-right text-[10px] leading-none text-black/60"
                style={{ height: HOUR_PX }}
              >
                {h}:00
              </div>
            ))}
          </div>
          <div
            className="relative min-w-0 flex-1 bg-white"
            style={{ height: DAY_HEIGHT }}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-zinc-200"
                style={{ top: h * HOUR_PX, height: HOUR_PX }}
              />
            ))}
            <button
              type="button"
              aria-label={LABEL_ADD_TIMED}
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
      <PaneHeader title={DAY_PANE_TITLE} hint={PANE_HINTS.day}>
        <div className="flex items-center justify-between gap-1">
          <NavChevron dir="prev" label={LABEL_PREV_DAY} onClick={() => onAddDay(-1)} />
          <span
            className={`min-w-0 flex-1 text-center text-[11px] font-semibold sm:text-xs ${weekdayTextClass(cursor)}`}
          >
            {formatDayHeader(cursor)}
          </span>
          <NavChevron dir="next" label={LABEL_NEXT_DAY} onClick={() => onAddDay(1)} />
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
  const { eventsForDate, getScopeComment, getMidLongTermPlan } = useAppData();
  const [cursor, setCursor] = useState(INITIAL_CURSOR);
  const [mobileTab, setMobileTab] = useState(3);
  const [scopeModal, setScopeModal] = useState<ScopeModalState>(null);
  const [mltpOpen, setMltpOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState<EventDraft | null>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);

  const dateKey = formatDateKey(cursor);
  const dayEvents = eventsForDate(dateKey);

  const yComment = getScopeComment(yearKey(cursor.getFullYear()));
  const mComment = getScopeComment(monthKey(cursor));
  const wComment = getScopeComment(weekKey(cursor));

  const planYearExcerpt = useCallback(
    (year: number) => yearPlanSummaryExcerpt(getMidLongTermPlan(), year),
    [getMidLongTermPlan],
  );

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
      heading: scopeHeadingYear(year),
    });
  };

  const board = (
    <>
      <YearPane
        cursor={cursor}
        comment={yComment}
        planYearExcerpt={planYearExcerpt}
        onSelectYear={onSelectYear}
        onOpenYearScope={openYearScope}
        onOpenPlan={() => setMltpOpen(true)}
      />
      <MonthPane
        cursor={cursor}
        comment={mComment}
        onSelectMonth={onSelectMonth}
        onAddYear={(d) => setCursor(startOfDay(addYears(cursor, d)))}
        onOpenScope={() =>
          setScopeModal({
            key: monthKey(cursor),
            heading: scopeHeadingYearMonth(
              cursor.getFullYear(),
              cursor.getMonth() + 1,
            ),
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

  const tabs = MOBILE_TABS;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex gap-1 border-b border-zinc-200 bg-white p-1.5 md:hidden"
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
                ? "border-zinc-400 bg-white text-black shadow-sm"
                : "border-transparent text-black/80"
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
            planYearExcerpt={planYearExcerpt}
            onSelectYear={onSelectYear}
            onOpenYearScope={openYearScope}
            onOpenPlan={() => setMltpOpen(true)}
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
                heading: scopeHeadingYearMonth(
              cursor.getFullYear(),
              cursor.getMonth() + 1,
            ),
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

      {mltpOpen ? (
        <MidLongTermPlanModal onClose={() => setMltpOpen(false)} />
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
