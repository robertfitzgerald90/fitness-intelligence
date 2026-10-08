import {
  localDateFromDate,
  localDateFromIso,
  localDateFromKey,
  localDateKey,
  sameLocalDate,
} from '@/domain/calendar/dates';

export function recordedAtForDate(dateKey: string, now: Date): string | null {
  const selected = localDateFromKey(dateKey.trim());
  if (!selected) {
    return null;
  }
  const today = localDateFromDate(now);
  const selectedStart = new Date(selected.year, selected.monthIndex, selected.day).getTime();
  const todayStart = new Date(today.year, today.monthIndex, today.day).getTime();
  if (selectedStart > todayStart) {
    return null;
  }
  if (sameLocalDate(selected, today)) {
    return now.toISOString();
  }
  return new Date(
    selected.year,
    selected.monthIndex,
    selected.day,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  ).toISOString();
}

export function isFutureDate(dateKey: string, now: Date): boolean {
  const selected = localDateFromKey(dateKey.trim());
  if (!selected) {
    return false;
  }
  const today = localDateFromDate(now);
  const selectedStart = new Date(selected.year, selected.monthIndex, selected.day).getTime();
  const todayStart = new Date(today.year, today.monthIndex, today.day).getTime();
  return selectedStart > todayStart;
}

export function dateKeyForRecord(recordedAt: string, fallback: string): string {
  const local = localDateFromIso(recordedAt);
  return local ? localDateKey(local) : fallback;
}
