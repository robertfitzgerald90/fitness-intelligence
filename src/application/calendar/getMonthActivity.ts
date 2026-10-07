import { formatActivityDay, formatMonthActivityLine, formatMonthName } from '@/application/calendar/format';
import {
  summarizeStrength,
  toStrengthActivity,
  toWorkoutItem,
  type StrengthWorkoutItem,
} from '@/application/calendar/strengthActivity';
import { trainContainer } from '@/application/train/container';
import type { StrengthCalendarActivity } from '@/domain/calendar/activity';
import { localDateFromIso, localDateKey, localDayStartIso, monthRange } from '@/domain/calendar/dates';

export type MonthActivityGroup = {
  dateKey: string;
  label: string;
  workouts: StrengthWorkoutItem[];
};

export type MonthActivityView = {
  title: string;
  summary: string;
  groups: MonthActivityGroup[];
};

export async function getMonthActivity(year: number, monthIndex: number): Promise<MonthActivityView> {
  const range = monthRange(year, monthIndex);
  const sessions = await trainContainer.sessions.getCompletedSessionsInRange(
    localDayStartIso(range.start),
    localDayStartIso(range.endExclusive),
  );
  const activities = sessions.map(toStrengthActivity).sort((left, right) => {
    const byTime = right.completedAt.localeCompare(left.completedAt);
    return byTime === 0 ? right.id.localeCompare(left.id) : byTime;
  });

  return {
    title: `${formatMonthName(year, monthIndex)} activity`,
    summary: formatMonthActivityLine(summarizeStrength(activities)),
    groups: groupByDate(activities),
  };
}

function groupByDate(activities: StrengthCalendarActivity[]): MonthActivityGroup[] {
  const groups: MonthActivityGroup[] = [];
  for (const activity of activities) {
    const local = localDateFromIso(activity.completedAt);
    if (!local) {
      continue;
    }
    const dateKey = localDateKey(local);
    const workout = toWorkoutItem(activity);
    const current = groups[groups.length - 1];
    if (current?.dateKey === dateKey) {
      current.workouts.push(workout);
      continue;
    }
    groups.push({
      dateKey,
      label: formatActivityDay(local),
      workouts: [workout],
    });
  }
  return groups;
}
