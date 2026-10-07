import { formatDuration } from '@/application/workout/format';
import type { CalendarActivity, StrengthCalendarActivity } from '@/domain/calendar/activity';
import { addLocalDays, localDateFromIso, sameLocalDate, type LocalDate } from '@/domain/calendar/dates';

export function formatMonthTitle(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatSelectedDate(date: LocalDate): string {
  return new Date(date.year, date.monthIndex, date.day).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });
}

export function formatMonthName(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString(undefined, { month: 'long' });
}

export function formatViewMonthActivity(year: number, monthIndex: number): string {
  return `View ${formatMonthName(year, monthIndex)} Activity →`;
}

export function formatActivityDay(date: LocalDate): string {
  return new Date(date.year, date.monthIndex, date.day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatRecentDay(completedAt: string, today: LocalDate): string {
  const local = localDateFromIso(completedAt);
  if (!local) {
    return 'Completed';
  }
  if (sameLocalDate(local, today)) {
    return 'Today';
  }
  if (sameLocalDate(local, addLocalDays(today, -1))) {
    return 'Yesterday';
  }
  const day = formatActivityDay(local);
  if (local.year === today.year) {
    return day;
  }
  return `${day}, ${local.year}`;
}

export type MonthStatBanner = {
  workouts: string;
  sets: string;
  duration: string;
};

export function formatMonthBanner(input: {
  workoutCount: number;
  completedSetCount: number;
  durationMinutes: number;
}): MonthStatBanner {
  return {
    workouts: countPhrase(input.workoutCount, 'workout'),
    sets: countPhrase(input.completedSetCount, 'set'),
    duration: formatTrainedDuration(input.durationMinutes),
  };
}

export function formatMonthActivityLine(input: {
  workoutCount: number;
  completedSetCount: number;
  durationMinutes: number;
}): string {
  const banner = formatMonthBanner(input);
  return `${banner.workouts} · ${banner.sets} · ${banner.duration}`;
}

export function formatTrainedDuration(totalMinutes: number): string {
  return `${formatCompactDuration(totalMinutes)} trained`;
}

export function formatCompactDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return '0m';
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

export function formatCompletedClock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Completed';
  }
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `Completed ${time}`;
}

export function formatRecentMeta(activity: StrengthCalendarActivity, today: LocalDate): string {
  const when = formatRecentDay(activity.completedAt, today);
  const duration = formatDuration(activity.startedAt, activity.completedAt);
  const sets = countPhrase(activity.completedSetCount, 'set');
  return `${when} · ${duration} · ${sets}`;
}

export function formatStrengthMeta(activity: StrengthCalendarActivity): string {
  const duration = formatDuration(activity.startedAt, activity.completedAt);
  const exercises = countPhrase(activity.exerciseCount, 'exercise');
  const sets = countPhrase(activity.completedSetCount, 'set');
  return `${duration} · ${exercises} · ${sets}`;
}

export function dayAccessibilityLabel(input: {
  date: LocalDate;
  isToday: boolean;
  isSelected: boolean;
  activities: CalendarActivity[];
}): string {
  const spoken = new Date(input.date.year, input.date.monthIndex, input.date.day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const parts = [spoken];
  if (input.isToday) {
    parts.push('Today');
  }
  if (input.isSelected) {
    parts.push('Selected');
  }
  const strength = input.activities.filter((activity) => activity.kind === 'strength').length;
  const runs = input.activities.filter((activity) => activity.kind === 'run').length;
  const activityParts = [presentCount(strength, 'strength workout'), presentCount(runs, 'run')].filter(
    (part): part is string => part !== null,
  );
  parts.push(activityParts.length > 0 ? activityParts.join(', ') : 'No workouts');
  return parts.join('. ');
}

function countPhrase(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function presentCount(count: number, noun: string): string | null {
  if (count <= 0) {
    return null;
  }
  return countPhrase(count, noun);
}
