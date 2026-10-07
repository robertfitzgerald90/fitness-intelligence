export type LocalDate = {
  year: number;
  monthIndex: number;
  day: number;
};

const WEEK_LENGTH = 7;

export function localDateFromDate(date: Date): LocalDate {
  return {
    year: date.getFullYear(),
    monthIndex: date.getMonth(),
    day: date.getDate(),
  };
}

export function localDateKey(date: LocalDate): string {
  const month = String(date.monthIndex + 1).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  return `${date.year}-${month}-${day}`;
}

export function localDateFromKey(key: string): LocalDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const check = new Date(year, monthIndex, day);
  if (check.getFullYear() !== year || check.getMonth() !== monthIndex || check.getDate() !== day) {
    return null;
  }
  return { year, monthIndex, day };
}

export function localDateFromIso(iso: string): LocalDate | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return localDateFromDate(date);
}

export function sameLocalDate(left: LocalDate, right: LocalDate): boolean {
  return left.year === right.year && left.monthIndex === right.monthIndex && left.day === right.day;
}

export function addLocalDays(date: LocalDate, days: number): LocalDate {
  return localDateFromDate(new Date(date.year, date.monthIndex, date.day + days));
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const shifted = new Date(year, monthIndex + delta, 1);
  return { year: shifted.getFullYear(), monthIndex: shifted.getMonth() };
}

export function dateInMonth(year: number, monthIndex: number, day: number): LocalDate {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return { year, monthIndex, day: Math.min(Math.max(day, 1), lastDay) };
}

export function monthRange(year: number, monthIndex: number): { start: LocalDate; endExclusive: LocalDate } {
  const next = shiftMonth(year, monthIndex, 1);
  return {
    start: { year, monthIndex, day: 1 },
    endExclusive: { year: next.year, monthIndex: next.monthIndex, day: 1 },
  };
}

export function parseMonthRoute(
  yearText: string,
  monthText: string,
): { year: number; monthIndex: number } | null {
  if (!/^\d{4}$/.test(yearText) || !/^\d{1,2}$/.test(monthText)) {
    return null;
  }
  const year = Number(yearText);
  const month = Number(monthText);
  if (month < 1 || month > 12) {
    return null;
  }
  return { year, monthIndex: month - 1 };
}

export function localDayStartIso(date: LocalDate): string {
  return new Date(date.year, date.monthIndex, date.day, 0, 0, 0, 0).toISOString();
}

export function buildMonthWeeks(year: number, monthIndex: number): LocalDate[][] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const lastWeekday = new Date(year, monthIndex, lastDay).getDay();
  const start = addLocalDays({ year, monthIndex, day: 1 }, -firstWeekday);
  const total = firstWeekday + lastDay + (WEEK_LENGTH - 1 - lastWeekday);
  const weeks: LocalDate[][] = [];
  for (let index = 0; index < total; index += WEEK_LENGTH) {
    const week: LocalDate[] = [];
    for (let offset = 0; offset < WEEK_LENGTH; offset += 1) {
      week.push(addLocalDays(start, index + offset));
    }
    weeks.push(week);
  }
  return weeks;
}
