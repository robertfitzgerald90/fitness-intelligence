import {
  dayAccessibilityLabel,
  formatCompletedClock,
  formatCompletedSetCount,
  formatMonthTitle,
  formatSelectedDate,
  formatStrengthMeta,
  formatTrainedDuration,
  formatWorkoutCount,
} from '@/application/calendar/format';
import { trainContainer } from '@/application/train/container';
import type { CompletedSessionInRange } from '@/data/repositories/workoutSessionRepository';
import { elapsedMinutes } from '@/domain/analytics/elapsed';
import {
  indicatorsFor,
  type CalendarActivity,
  type StrengthCalendarActivity,
} from '@/domain/calendar/activity';
import {
  addLocalDays,
  buildMonthWeeks,
  localDateFromIso,
  localDateKey,
  localDayStartIso,
  sameLocalDate,
  type LocalDate,
} from '@/domain/calendar/dates';

export type CalendarDayView = {
  dateKey: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  accessibilityLabel: string;
  indicators: {
    strength: boolean;
    run: boolean;
  };
};

export type CalendarWorkoutItem = {
  id: string;
  kind: 'strength';
  name: string;
  meta: string;
  completedLabel: string;
};

export type CalendarMonthView = {
  year: number;
  monthIndex: number;
  monthTitle: string;
  selectedDateKey: string;
  summary: {
    workouts: string;
    sets: string;
    duration: string;
  };
  weeks: CalendarDayView[][];
  selectedTitle: string;
  workouts: CalendarWorkoutItem[];
};

export async function getCalendarMonth(input: {
  year: number;
  monthIndex: number;
  selected: LocalDate;
  today: LocalDate;
}): Promise<CalendarMonthView> {
  const weeks = buildMonthWeeks(input.year, input.monthIndex);
  const first = weeks[0]?.[0];
  const last = weeks[weeks.length - 1]?.[6];
  if (!first || !last) {
    throw new Error('Calendar month is empty.');
  }
  const sessions = await trainContainer.sessions.getCompletedSessionsInRange(
    localDayStartIso(first),
    localDayStartIso(addLocalDays(last, 1)),
  );
  const byDate = groupByLocalDate(sessions);
  const monthActivities = sessionsInMonth(byDate, input.year, input.monthIndex);
  const selectedKey = localDateKey(input.selected);
  const selectedActivities = byDate.get(selectedKey) ?? [];

  return {
    year: input.year,
    monthIndex: input.monthIndex,
    monthTitle: formatMonthTitle(input.year, input.monthIndex),
    selectedDateKey: selectedKey,
    summary: summarize(monthActivities),
    weeks: weeks.map((week) =>
      week.map((date) => {
        const activities = byDate.get(localDateKey(date)) ?? [];
        return {
          dateKey: localDateKey(date),
          dayNumber: date.day,
          inMonth: date.year === input.year && date.monthIndex === input.monthIndex,
          isToday: sameLocalDate(date, input.today),
          isSelected: sameLocalDate(date, input.selected),
          accessibilityLabel: dayAccessibilityLabel({
            date,
            isToday: sameLocalDate(date, input.today),
            isSelected: sameLocalDate(date, input.selected),
            activities,
          }),
          indicators: indicatorsFor(activities),
        };
      }),
    ),
    selectedTitle: formatSelectedDate(input.selected),
    workouts: selectedActivities.flatMap((activity) =>
      activity.kind === 'strength' ? [toWorkoutItem(activity)] : [],
    ),
  };
}

function groupByLocalDate(sessions: CompletedSessionInRange[]): Map<string, CalendarActivity[]> {
  const byDate = new Map<string, CalendarActivity[]>();
  for (const session of sessions) {
    const local = localDateFromIso(session.completedAt);
    if (!local) {
      continue;
    }
    const key = localDateKey(local);
    const list = byDate.get(key) ?? [];
    list.push(toStrengthActivity(session));
    byDate.set(key, list);
  }
  return byDate;
}

function sessionsInMonth(
  byDate: Map<string, CalendarActivity[]>,
  year: number,
  monthIndex: number,
): StrengthCalendarActivity[] {
  const activities: StrengthCalendarActivity[] = [];
  for (const list of byDate.values()) {
    for (const activity of list) {
      const local = localDateFromIso(activity.completedAt);
      const inMonth = local?.year === year && local.monthIndex === monthIndex;
      if (activity.kind === 'strength' && inMonth) {
        activities.push(activity);
      }
    }
  }
  return activities;
}

function summarize(activities: StrengthCalendarActivity[]): CalendarMonthView['summary'] {
  const completedSetCount = activities.reduce((count, activity) => count + activity.completedSetCount, 0);
  const durationMinutes = activities.reduce((count, activity) => count + activity.durationMinutes, 0);
  return {
    workouts: formatWorkoutCount(activities.length),
    sets: formatCompletedSetCount(completedSetCount),
    duration: formatTrainedDuration(durationMinutes),
  };
}

function toStrengthActivity(session: CompletedSessionInRange): StrengthCalendarActivity {
  return {
    id: session.id,
    kind: 'strength',
    name: session.name,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationMinutes: elapsedMinutes(session.startedAt, session.completedAt),
    exerciseCount: session.exerciseCount,
    completedSetCount: session.completedSetCount,
  };
}

function toWorkoutItem(activity: StrengthCalendarActivity): CalendarWorkoutItem {
  return {
    id: activity.id,
    kind: 'strength',
    name: activity.name,
    meta: formatStrengthMeta(activity),
    completedLabel: formatCompletedClock(activity.completedAt),
  };
}
