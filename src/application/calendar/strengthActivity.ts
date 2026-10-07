import { formatCompletedClock, formatStrengthMeta } from '@/application/calendar/format';
import type { CompletedSessionInRange } from '@/data/repositories/workoutSessionRepository';
import { elapsedMinutes } from '@/domain/analytics/elapsed';
import type { StrengthCalendarActivity } from '@/domain/calendar/activity';

export function toStrengthActivity(session: CompletedSessionInRange): StrengthCalendarActivity {
  return {
    id: session.id,
    kind: 'strength',
    status: 'completed',
    name: session.name,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationMinutes: elapsedMinutes(session.startedAt, session.completedAt),
    exerciseCount: session.exerciseCount,
    completedSetCount: session.completedSetCount,
  };
}

export type StrengthWorkoutItem = {
  id: string;
  kind: 'strength';
  name: string;
  meta: string;
  completedLabel: string;
};

export function toWorkoutItem(activity: StrengthCalendarActivity): StrengthWorkoutItem {
  return {
    id: activity.id,
    kind: 'strength',
    name: activity.name,
    meta: formatStrengthMeta(activity),
    completedLabel: formatCompletedClock(activity.completedAt),
  };
}

export function summarizeStrength(activities: StrengthCalendarActivity[]): {
  workoutCount: number;
  completedSetCount: number;
  durationMinutes: number;
} {
  return {
    workoutCount: activities.length,
    completedSetCount: activities.reduce((count, activity) => count + activity.completedSetCount, 0),
    durationMinutes: activities.reduce((count, activity) => count + activity.durationMinutes, 0),
  };
}
