import { addDays, getMonday, startOfDay } from "@/lib/calendar";

export type WeekInMonth = {
  index: number;
  monday: Date;
  sunday: Date;
  label: string;
  rangeLabel: string;
};

function formatMd(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 月曜始まりの週で、その月に日が含まれる週を第1週から列挙 */
export function listWeeksInMonth(year: number, month: number): WeekInMonth[] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  first.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  const weeks: WeekInMonth[] = [];
  let monday = getMonday(first);
  let index = 1;

  while (monday <= last) {
    const sunday = addDays(monday, 6);
    if (sunday >= first) {
      weeks.push({
        index,
        monday: startOfDay(monday),
        sunday: startOfDay(sunday),
        label: `第${index}週`,
        rangeLabel: `${formatMd(monday)}〜${formatMd(sunday)}`,
      });
      index += 1;
    }
    monday = addDays(monday, 7);
  }

  return weeks;
}

export function weekInMonthLabel(week: WeekInMonth): string {
  return `${week.label}（${week.rangeLabel}）`;
}

export function findWeekInMonth(
  year: number,
  month: number,
  d: Date,
): WeekInMonth | null {
  const monday = getMonday(d);
  return (
    listWeeksInMonth(year, month).find(
      (w) => w.monday.getTime() === monday.getTime(),
    ) ?? null
  );
}

export function isSameWeekMonday(a: Date, monday: Date): boolean {
  return getMonday(a).getTime() === startOfDay(monday).getTime();
}
