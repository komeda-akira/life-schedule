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
import { useRegisterCalendarJump } from "@/components/CalendarNavigation";
import { parseInstanceEventId } from "@/lib/recurrence";
import { EventModal } from "@/components/EventModal";
import { MidLongTermPlanModal } from "@/components/MidLongTermPlanModal";
import { DailyWorksheetModal } from "@/components/DailyWorksheetModal";
import { MonthlyWorksheetModal } from "@/components/MonthlyWorksheetModal";
import { WeeklyWorksheetModal } from "@/components/WeeklyWorksheetModal";
import { ScopeCommentModal } from "@/components/ScopeCommentModal";
import {
  DayScheduleTimeline,
  DAY_TIMELINE_HOUR_PX,
} from "@/components/DayScheduleTimeline";
import { EventQuickCreatePopover } from "@/components/EventQuickCreatePopover";
import { MonthSelfCounselingPanel } from "@/components/MonthSelfCounselingPanel";
import { SheetOpenActionButton } from "@/components/OpenLayerArrow";
import { dayWorksheetKey } from "@/lib/daily-worksheet";
import { monthlyWorksheetExcerpt } from "@/lib/monthly-worksheet";
import { weeklyWorksheetExcerpt } from "@/lib/weekly-worksheet";
import {
  findWeekInMonth,
  isSameWeekMonday,
  listWeeksInMonth,
  weekInMonthLabel,
  type WeekInMonth,
} from "@/lib/week-in-month";
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
  listYearsChronological,
  startOfDay,
  weekdayTextClass,
  YEAR_PANE_MAX,
  YEAR_PANE_MIN,
} from "@/lib/calendar";
import {
  formatDateKey,
  monthKey,
  weekKey,
  yearKey,
} from "@/lib/scope-keys";
import {
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
  OPEN_DAILY_SHEET_ACTION,
  OPEN_MONTHLY_SHEET_ACTION,
  OPEN_WEEKLY_SHEET_ACTION,
  DAY_SWITCH_HINT,
  MONTH_SWITCH_HINT,
  scopeCommentTitle,
  WEEK_DAY_SECTION,
  WEEK_SWITCH_HINT,
  WEEK_SWITCH_SECTION,
  scopeHeadingYear,
  scopeHeadingYearMonth,
  WEEK_PANE_TITLE,
  DAY_PANE_TITLE,
  OPEN_MLTP_ACTION,
  OPEN_YEAR_SCOPE_ACTION,
  YEAR_PANE_TITLE,
  YEAR_START_LABEL,
  YEAR_SWITCH_HINT,
} from "@/lib/pane-labels";
import { yearPlanSummaryExcerpt } from "@/lib/mid-long-term-plan";
import { SUCCESS_STEP_NUMBERS } from "@/lib/success-steps-content";
import { isMultiDayEvent } from "@/lib/event-span";
import type { CalendarEvent, EventKind } from "@/lib/types";

/** 月・週・日ペインのナビ日付（年／年月／年月日） */
const PANE_DATE_NAV_CLASS =
  "min-w-0 flex-1 text-center text-sm font-semibold underline decoration-zinc-800 underline-offset-2 sm:text-base";

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
}: {
  title: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-zinc-200 bg-white px-2 py-2">
      <div className="text-center text-base font-semibold text-black">{title}</div>
      {hint ? (
        <p className="mt-0.5 text-center text-xs leading-snug text-black/60">
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

function YearScopeCommentExcerpt({ text }: { text: string }) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return (
    <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug break-words whitespace-pre-wrap text-black/55">
      {trimmed}
    </p>
  );
}

function PaneDateLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`min-w-0 flex-1 text-center text-sm font-semibold text-black sm:text-base ${className}`}
    >
      {children}
    </span>
  );
}

type ScopeModalState = { key: string; heading: string } | null;

type MonthlySheetModalState = {
  key: string;
  year: number;
  month: number;
  heading: string;
} | null;

type DailySheetModalState = {
  key: string;
  date: Date;
} | null;

type WeeklySheetModalState = {
  key: string;
  weekMonday: Date;
  heading: string;
} | null;
type EventDraft = {
  event: CalendarEvent | null;
  dateKey: string;
  defaultStartMin?: number;
  defaultEndMin?: number;
  defaultKind?: EventKind;
  prefilledTitle?: string;
};

type QuickCreateState = {
  startMin: number;
  endMin: number;
} | null;

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
  getYearScopeComment,
  planYearExcerpt,
  onSelectYear,
  onOpenYearScope,
  onOpenPlan,
}: {
  cursor: Date;
  getYearScopeComment: (year: number) => string;
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
      <PaneHeader title={YEAR_PANE_TITLE} hint={PANE_HINTS.year} />
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <ul className="flex flex-col gap-1">
          {years.map((year) => {
            const selected = year === y;
            const isStart = year === YEAR_PANE_MIN;
            const summary = planYearExcerpt(year);
            const yearComment = getYearScopeComment(year);
            return (
              <li
                key={year}
                data-year={year}
                className="relative flex items-stretch gap-0.5"
              >
                <button
                  type="button"
                  onClick={() => onSelectYear(year)}
                  className={`min-w-0 flex-1 rounded-md px-2.5 py-2 text-left text-sm font-medium text-black transition-colors ${selectClass(selected)}`}
                >
                  <span className="block min-w-0">
                    <span className="flex min-w-0 items-baseline gap-1.5">
                      <span className="shrink-0 tabular-nums">{year}年</span>
                      {isStart ? (
                        <span className="shrink-0 text-[10px] font-normal text-black/60">
                          {YEAR_START_LABEL}
                        </span>
                      ) : null}
                    </span>
                    {summary ? (
                      <span className="mt-0.5 block truncate text-[10px] font-normal text-black/60">
                        {summary}
                      </span>
                    ) : null}
                    {yearComment ? (
                      <YearScopeCommentExcerpt text={yearComment} />
                    ) : null}
                  </span>
                </button>
                {selected ? <Connector /> : null}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[9px] leading-snug text-black/45">
          {YEAR_SWITCH_HINT}
        </p>
        <SheetOpenActionButton
          onClick={onOpenPlan}
          title={OPEN_MLTP_ACTION}
          subtitle={scopeHeadingYear(y)}
          className="mt-2"
          successStep={SUCCESS_STEP_NUMBERS.plan}
        />
        <SheetOpenActionButton
          onClick={() => onOpenYearScope(y)}
          title={OPEN_YEAR_SCOPE_ACTION}
          subtitle={scopeCommentTitle(y)}
          className="mt-2 border-zinc-200 bg-white hover:bg-zinc-50"
        />
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
          <PaneDateLabel className={PANE_DATE_NAV_CLASS}>
            {formatMonthHeader(cursor)}
          </PaneDateLabel>
          <NavChevron dir="next" label={LABEL_NEXT_YEAR} onClick={() => onAddYear(1)} />
        </div>
      </PaneHeader>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
        {comment ? (
          <div className="mb-2 shrink-0 rounded border border-dashed border-zinc-200 px-2 py-1">
            <ScopeExcerpt text={comment} />
          </div>
        ) : null}
        <div className="grid shrink-0 grid-cols-3 gap-1.5">
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
        <p className="mt-2 shrink-0 text-[9px] leading-snug text-black/45">
          {MONTH_SWITCH_HINT}
        </p>
        <SheetOpenActionButton
          onClick={onOpenScope}
          title={OPEN_MONTHLY_SHEET_ACTION}
          subtitle={scopeHeadingYearMonth(
            cursor.getFullYear(),
            cursor.getMonth() + 1,
          )}
          className="mt-2 shrink-0"
          successStep={SUCCESS_STEP_NUMBERS.action}
        />
        <div className="mt-2 min-h-0 flex-1">
          <MonthSelfCounselingPanel />
        </div>
      </div>
    </div>
  );
}

function WeekPane({
  cursor,
  comment,
  weeksInMonth,
  onSelectWeekOfMonth,
  onSelectDay,
  onAddWeek,
  onOpenWeeklySheet,
}: {
  cursor: Date;
  comment: string;
  weeksInMonth: WeekInMonth[];
  onSelectWeekOfMonth: (monday: Date) => void;
  onSelectDay: (d: Date) => void;
  onAddWeek: (delta: number) => void;
  onOpenWeeklySheet: () => void;
}) {
  const days = useMemo(() => {
    const monday = getMonday(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [cursor]);

  const cursorMonday = getMonday(cursor);
  const selectedWeek = useMemo(
    () => weeksInMonth.find((w) => isSameWeekMonday(cursor, w.monday)),
    [weeksInMonth, cursor],
  );

  return (
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col border-r border-zinc-200 md:min-h-[520px]">
      <PaneHeader title={WEEK_PANE_TITLE} hint={PANE_HINTS.week}>
        <div className="flex items-center justify-between gap-1">
          <NavChevron dir="prev" label={LABEL_PREV_WEEK} onClick={() => onAddWeek(-1)} />
          <PaneDateLabel className={PANE_DATE_NAV_CLASS}>
            {formatWeekHeader(cursor)}
          </PaneDateLabel>
          <NavChevron dir="next" label={LABEL_NEXT_WEEK} onClick={() => onAddWeek(1)} />
        </div>
      </PaneHeader>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {comment ? (
          <div className="mb-2 rounded border border-dashed border-zinc-200 px-2 py-1">
            <ScopeExcerpt text={comment} />
          </div>
        ) : null}
        <p className="mb-0.5 text-[10px] font-medium text-black/60">
          {WEEK_SWITCH_SECTION}
        </p>
        <p className="mb-1.5 text-[9px] leading-snug text-black/45">
          {WEEK_SWITCH_HINT}
        </p>
        <ul className="mb-2 flex flex-col gap-1">
          {weeksInMonth.map((w) => {
            const selected = isSameWeekMonday(cursor, w.monday);
            return (
              <li key={w.index} className="relative">
                <button
                  type="button"
                  onClick={() => onSelectWeekOfMonth(w.monday)}
                  className={`w-full rounded-md px-2.5 py-2 text-left text-sm font-medium text-black ${selectClass(selected)}`}
                >
                  {weekInMonthLabel(w)}
                </button>
                {selected ? <Connector /> : null}
              </li>
            );
          })}
        </ul>
        {selectedWeek ? (
          <SheetOpenActionButton
            onClick={onOpenWeeklySheet}
            title={OPEN_WEEKLY_SHEET_ACTION}
            subtitle={weekInMonthLabel(selectedWeek)}
            className="mb-3"
            successStep={SUCCESS_STEP_NUMBERS.action}
          />
        ) : null}
        <p className="mb-1 text-[10px] font-medium text-black/60">
          {WEEK_DAY_SECTION}
        </p>
        <p className="mb-1.5 text-[9px] leading-snug text-black/45">
          {DAY_SWITCH_HINT}
        </p>
        <ul className="mb-2 flex flex-col gap-1">
          {days.map((d) => {
            const selected = isSameDay(d, cursor);
            const inCurrentWeek = isSameWeekMonday(d, cursorMonday);
            return (
              <li key={formatDateKey(d)} className="relative">
                <button
                  type="button"
                  onClick={() => onSelectDay(startOfDay(d))}
                  className={`w-full rounded-md px-2.5 py-2 text-left text-sm font-medium ${weekdayTextClass(d)} ${selectClass(selected)} ${!inCurrentWeek ? "opacity-70" : ""}`}
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

function DayPane({
  cursor,
  events,
  onAddDay,
  onOpenDailySheet,
  onCreateRange,
  onCreateAllDay,
  onEdit,
  onUpdateRange,
  scrollRef,
}: {
  cursor: Date;
  events: CalendarEvent[];
  onAddDay: (delta: number) => void;
  onOpenDailySheet: () => void;
  onCreateRange: (startMin: number, endMin: number) => void;
  onCreateAllDay: () => void;
  onEdit: (id: string) => void;
  onUpdateRange: (id: string, startMin: number, endMin: number) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex min-h-[420px] min-w-0 flex-1 flex-col md:min-h-[520px]">
      <PaneHeader title={DAY_PANE_TITLE} hint={PANE_HINTS.day}>
        <div className="flex items-center justify-between gap-1">
          <NavChevron dir="prev" label={LABEL_PREV_DAY} onClick={() => onAddDay(-1)} />
          <PaneDateLabel className={weekdayTextClass(cursor)}>
            {formatDayHeader(cursor)}
          </PaneDateLabel>
          <NavChevron dir="next" label={LABEL_NEXT_DAY} onClick={() => onAddDay(1)} />
        </div>
        <SheetOpenActionButton
          onClick={onOpenDailySheet}
          title={OPEN_DAILY_SHEET_ACTION}
          subtitle={formatDayHeader(cursor)}
          subtitleClassName={weekdayTextClass(cursor)}
          className="mt-2"
          successStep={SUCCESS_STEP_NUMBERS.action}
        />
      </PaneHeader>
      <DayScheduleTimeline
        date={cursor}
        events={events}
        scrollRef={scrollRef}
        onCreateRange={onCreateRange}
        onCreateAllDay={onCreateAllDay}
        onEdit={onEdit}
        onUpdateRange={onUpdateRange}
      />
    </div>
  );
}

export function CalendarPanes() {
  const {
    eventsForDate,
    upsertEvent,
    getScopeComment,
    getMidLongTermPlan,
    getMonthlyWorksheet,
    getWeeklyWorksheet,
  } = useAppData();
  const [cursor, setCursor] = useState(INITIAL_CURSOR);
  const [mobileTab, setMobileTab] = useState(3);
  const [scopeModal, setScopeModal] = useState<ScopeModalState>(null);
  const [monthlySheetModal, setMonthlySheetModal] =
    useState<MonthlySheetModalState>(null);
  const [weeklySheetModal, setWeeklySheetModal] =
    useState<WeeklySheetModalState>(null);
  const [dailySheetModal, setDailySheetModal] =
    useState<DailySheetModalState>(null);
  const [mltpOpen, setMltpOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState<EventDraft | null>(null);
  const [quickCreate, setQuickCreate] = useState<QuickCreateState>(null);
  const dayScrollRef = useRef<HTMLDivElement>(null);

  const dateKey = formatDateKey(cursor);
  const dayEvents = eventsForDate(dateKey);

  const jumpToDateKey = useCallback((key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    if (!y || !m || !d) return;
    setCursor(new Date(y, m - 1, d));
    setMobileTab(3);
  }, []);

  useRegisterCalendarJump(jumpToDateKey);

  const mComment = getScopeComment(monthKey(cursor));
  const wComment = getScopeComment(weekKey(cursor));

  const monthExcerpt = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth() + 1;
    const sheetExcerpt = monthlyWorksheetExcerpt(
      getMonthlyWorksheet(monthKey(cursor), y, m),
    );
    if (sheetExcerpt) return sheetExcerpt;
    return mComment;
  }, [cursor, getMonthlyWorksheet, mComment]);

  const weeksInMonth = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth() + 1;
    return listWeeksInMonth(y, m);
  }, [cursor]);

  const weekExcerpt = useMemo(() => {
    const monday = getMonday(cursor);
    const sheetExcerpt = weeklyWorksheetExcerpt(
      getWeeklyWorksheet(weekKey(monday), monday),
    );
    if (sheetExcerpt) return sheetExcerpt;
    return wComment;
  }, [cursor, getWeeklyWorksheet, wComment]);

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
    el.scrollTop = Math.max(
      0,
      (min / 60) * DAY_TIMELINE_HOUR_PX - el.clientHeight / 3,
    );
  }, [cursor, dateKey]);

  const openEvent = (draft: {
    dateKey?: string;
    event?: CalendarEvent | null;
    defaultStartMin?: number;
    defaultEndMin?: number;
    defaultKind?: EventKind;
    prefilledTitle?: string;
  }) => {
    setQuickCreate(null);
    setEventDraft({
      dateKey: draft.dateKey ?? dateKey,
      event: draft.event ?? null,
      defaultStartMin: draft.defaultStartMin,
      defaultEndMin: draft.defaultEndMin,
      defaultKind: draft.defaultKind,
      prefilledTitle: draft.prefilledTitle,
    });
  };

  const onEditEvent = (id: string) => {
    const ev = dayEvents.find((e) => e.id === id);
    if (ev) openEvent({ event: ev });
  };

  const onUpdateEventRange = useCallback(
    (id: string, startMin: number, endMin: number) => {
      const ev = dayEvents.find((e) => e.id === id);
      if (!ev || ev.kind !== "timed" || isMultiDayEvent(ev)) return;
      const scope = parseInstanceEventId(ev.id) ? "single" : "all";
      upsertEvent({ ...ev, startMin, endMin }, scope);
    },
    [dayEvents, upsertEvent],
  );

  const onCreateRange = useCallback((startMin: number, endMin: number) => {
    setQuickCreate({ startMin, endMin });
  }, []);

  const onCreateAllDay = () => {
    openEvent({ defaultKind: "allDay" });
  };

  const onSelectYear = (year: number) => {
    const d = new Date(cursor);
    d.setFullYear(year);
    setCursor(startOfDay(d));
  };

  const openMonthlySheet = useCallback((d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    setMonthlySheetModal({
      key: monthKey(d),
      year: y,
      month: m,
      heading: scopeHeadingYearMonth(y, m),
    });
  }, []);

  const openDailySheet = useCallback((d: Date) => {
    const day = startOfDay(d);
    setDailySheetModal({
      key: dayWorksheetKey(day),
      date: day,
    });
  }, []);

  const openWeeklySheet = useCallback(
    (d: Date, displayYear: number, displayMonth: number) => {
      const monday = startOfDay(getMonday(d));
      const w = findWeekInMonth(displayYear, displayMonth, monday);
      const heading = w
        ? `${displayYear}年${displayMonth}月 ${weekInMonthLabel(w)}`
        : formatWeekHeader(monday);
      setWeeklySheetModal({
        key: weekKey(monday),
        weekMonday: monday,
        heading,
      });
    },
    [],
  );

  const onSelectWeekOfMonth = useCallback((monday: Date) => {
    setCursor(startOfDay(monday));
    setMobileTab(2);
  }, []);

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
        getYearScopeComment={(year) => getScopeComment(yearKey(year))}
        planYearExcerpt={planYearExcerpt}
        onSelectYear={onSelectYear}
        onOpenYearScope={openYearScope}
        onOpenPlan={() => setMltpOpen(true)}
      />
      <MonthPane
        cursor={cursor}
        comment={monthExcerpt}
        onSelectMonth={onSelectMonth}
        onAddYear={(d) => setCursor(startOfDay(addYears(cursor, d)))}
        onOpenScope={() => openMonthlySheet(cursor)}
      />
      <WeekPane
        cursor={cursor}
        comment={weekExcerpt}
        weeksInMonth={weeksInMonth}
        onSelectWeekOfMonth={onSelectWeekOfMonth}
        onSelectDay={onSelectDay}
        onAddWeek={(d) => setCursor(startOfDay(addDays(cursor, d * 7)))}
        onOpenWeeklySheet={() =>
          openWeeklySheet(
            cursor,
            cursor.getFullYear(),
            cursor.getMonth() + 1,
          )
        }
      />
      <DayPane
        cursor={cursor}
        events={dayEvents}
        onAddDay={(d) => setCursor(startOfDay(addDays(cursor, d)))}
        onOpenDailySheet={() => openDailySheet(cursor)}
        onCreateRange={onCreateRange}
        onCreateAllDay={onCreateAllDay}
        onEdit={onEditEvent}
        onUpdateRange={onUpdateEventRange}
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
            getYearScopeComment={(year) => getScopeComment(yearKey(year))}
            planYearExcerpt={planYearExcerpt}
            onSelectYear={onSelectYear}
            onOpenYearScope={openYearScope}
            onOpenPlan={() => setMltpOpen(true)}
          />
        ) : null}
        {mobileTab === 1 ? (
          <MonthPane
            cursor={cursor}
            comment={monthExcerpt}
            onSelectMonth={onSelectMonth}
            onAddYear={(d) => setCursor(startOfDay(addYears(cursor, d)))}
            onOpenScope={() => openMonthlySheet(cursor)}
          />
        ) : null}
        {mobileTab === 2 ? (
          <WeekPane
            cursor={cursor}
            comment={weekExcerpt}
            weeksInMonth={weeksInMonth}
            onSelectWeekOfMonth={onSelectWeekOfMonth}
            onSelectDay={onSelectDay}
            onAddWeek={(d) => setCursor(startOfDay(addDays(cursor, d * 7)))}
            onOpenWeeklySheet={() =>
              openWeeklySheet(
                cursor,
                cursor.getFullYear(),
                cursor.getMonth() + 1,
              )
            }
          />
        ) : null}
        {mobileTab === 3 ? (
          <DayPane
            cursor={cursor}
            events={dayEvents}
            onAddDay={(d) => setCursor(startOfDay(addDays(cursor, d)))}
            onOpenDailySheet={() => openDailySheet(cursor)}
            onCreateRange={onCreateRange}
            onCreateAllDay={onCreateAllDay}
            onEdit={onEditEvent}
            onUpdateRange={onUpdateEventRange}
            scrollRef={dayScrollRef}
          />
        ) : null}
      </div>

      {monthlySheetModal ? (
        <MonthlyWorksheetModal
          monthKey={monthlySheetModal.key}
          year={monthlySheetModal.year}
          month={monthlySheetModal.month}
          heading={monthlySheetModal.heading}
          onClose={() => setMonthlySheetModal(null)}
        />
      ) : null}

      {weeklySheetModal ? (
        <WeeklyWorksheetModal
          weekKey={weeklySheetModal.key}
          weekMonday={weeklySheetModal.weekMonday}
          heading={weeklySheetModal.heading}
          onClose={() => setWeeklySheetModal(null)}
        />
      ) : null}

      {dailySheetModal ? (
        <DailyWorksheetModal
          dayKey={dailySheetModal.key}
          date={dailySheetModal.date}
          onClose={() => setDailySheetModal(null)}
        />
      ) : null}

      {scopeModal ? (
        <ScopeCommentModal
          scopeKey={scopeModal.key}
          heading={scopeModal.heading}
          onClose={() => setScopeModal(null)}
        />
      ) : null}

      {mltpOpen ? (
        <MidLongTermPlanModal
          initialYear={cursor.getFullYear()}
          onClose={() => setMltpOpen(false)}
        />
      ) : null}

      {quickCreate ? (
        <EventQuickCreatePopover
          dateKey={dateKey}
          startMin={quickCreate.startMin}
          endMin={quickCreate.endMin}
          onClose={() => setQuickCreate(null)}
          onMoreDetails={({ title, startMin, endMin }) => {
            openEvent({
              defaultStartMin: startMin,
              defaultEndMin: endMin,
              defaultKind: "timed",
              prefilledTitle: title,
            });
          }}
        />
      ) : null}
      {eventDraft ? (
        <EventModal
          event={eventDraft.event}
          dateKey={eventDraft.dateKey}
          defaultStartMin={eventDraft.defaultStartMin}
          defaultEndMin={eventDraft.defaultEndMin}
          defaultKind={eventDraft.defaultKind}
          prefilledTitle={eventDraft.prefilledTitle}
          onClose={() => setEventDraft(null)}
        />
      ) : null}
    </div>
  );
}
