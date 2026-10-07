import {
  dayAccessibilityLabel,
  formatMonthBanner,
  formatMonthTitle,
  formatRecentMeta,
  formatSelectedDate,
  type MonthStatBanner,
} from '@/application/calendar/format';
import {
  summarizeStrength,
  toStrengthActivity,
  toWorkoutItem,
  type StrengthWorkoutItem,
} from '@/application/calendar/strengthActivity';
import { trainContainer } from '@/application/train/container';
import type { CompletedSessionInRange } from '@/data/repositories/workoutSessionRepository';
import { indicatorsFor, type CalendarActivity, type StrengthCalendarActivity } from '@/domain/calendar/activity';
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

export type CalendarWorkoutItem = StrengthWorkoutItem;

export type CalendarRecentItem = {
  id: string;
  kind: 'strength';
  name: string;
  meta: string;
};

export type CalendarLowerSection =
  | { mode: 'workouts'; title: string; workouts: CalendarWorkoutItem[] }
  | { mode: 'recent'; items: CalendarRecentItem[] }
  | { mode: 'empty'; title: string };

export type CalendarMonthView = {
  year: number;
  monthIndex: number;
  monthTitle: string;
  selectedDateKey: string;
  summary: MonthStatBanner;
  weeks: CalendarDayView[][];
  lower: CalendarLowerSection;
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
  const selectedActivities = (byDate.get(selectedKey) ?? []).filter(
    (activity): activity is StrengthCalendarActivity => activity.kind === 'strength',
  );
  const recent =
    selectedActivities.length === 0 ? await trainContainer.sessions.getRecentCompletedSessions(3) : [];

  return {
    year: input.year,
    monthIndex: input.monthIndex,
    monthTitle: formatMonthTitle(input.year, input.monthIndex),
    selectedDateKey: selectedKey,
    summary: formatMonthBanner(summarizeStrength(monthActivities)),
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
    lower: lowerSection(input.selected, input.today, selectedActivities, recent),
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
    const activity = toStrengthActivity(session);
    const list = byDate.get(key) ?? [];
    list.push(activity);
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

function lowerSection(
  selected: LocalDate,
  today: LocalDate,
  selectedActivities: StrengthCalendarActivity[],
  recent: CompletedSessionInRange[],
): CalendarLowerSection {
  const title = formatSelectedDate(selected);
  if (selectedActivities.length > 0) {
    return {
      mode: 'workouts',
      title,
      workouts: selectedActivities.map(toWorkoutItem),
    };
  }
  const items = recent.map((session) => {
    const activity = toStrengthActivity(session);
    return {
      id: activity.id,
      kind: 'strength' as const,
      name: activity.name,
      meta: formatRecentMeta(activity, today),
    };
  });
  if (items.length === 0) {
    return { mode: 'empty', title };
  }
  return { mode: 'recent', items };
}

