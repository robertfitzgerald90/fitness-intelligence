export const calendarActivityKinds = ['strength', 'run'] as const;

export type CalendarActivityKind = (typeof calendarActivityKinds)[number];

export const calendarActivityStatuses = ['completed', 'planned'] as const;

export type CalendarActivityStatus = (typeof calendarActivityStatuses)[number];

type CalendarActivityBase = {
  id: string;
  name: string;
  status: 'completed';
  completedAt: string;
  durationMinutes: number;
};

export type StrengthCalendarActivity = CalendarActivityBase & {
  kind: 'strength';
  startedAt: string;
  exerciseCount: number;
  completedSetCount: number;
};

export type RunCalendarActivity = CalendarActivityBase & {
  kind: 'run';
};

export type CalendarActivity = StrengthCalendarActivity | RunCalendarActivity;

export type CalendarDayIndicators = {
  strength: boolean;
  run: boolean;
};

export function indicatorsFor(activities: CalendarActivity[]): CalendarDayIndicators {
  return {
    strength: activities.some((activity) => activity.kind === 'strength'),
    run: activities.some((activity) => activity.kind === 'run'),
  };
}
