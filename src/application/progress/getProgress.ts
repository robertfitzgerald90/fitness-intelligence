import {
  countPhrase,
  currentMetricLabel,
  formatComparison,
  formatFirstRecorded,
  formatHistoryLine,
  formatPeriodBanner,
  formatPerformanceValue,
  formatProgressDate,
  formatSignedDelta,
  formatSinceRecorded,
  formatWeeklyRate,
} from '@/application/progress/format';
import { trainContainer } from '@/application/train/container';
import type { CompletedSessionInRange } from '@/data/repositories/workoutSessionRepository';
import { elapsedMinutes } from '@/domain/analytics/elapsed';
import {
  activeDateKeys,
  averageWorkoutsPerWeek,
  buildSessionPoints,
  exerciseSeries,
  inclusiveSpanDays,
  isInWindow,
  metricDelta,
  mondayWeek,
  periodWindow,
  primaryMetric,
  recentImprovements,
  type ExerciseSeries,
  type ProgressPeriod,
} from '@/domain/analytics/exerciseProgress';
import { localDateKey, type LocalDate } from '@/domain/calendar/dates';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const EARLIEST_ISO = '1970-01-01T00:00:00.000Z';

export type ProgressExerciseItem = {
  exerciseId: string;
  name: string;
  comparison: string | null;
  firstRecorded: string | null;
  delta: string | null;
  deltaPositive: boolean;
  sessionsLabel: string;
  trend: number[] | null;
  trendLabel: string;
};

export type ProgressImprovementItem = {
  exerciseId: string;
  name: string;
  comparison: string;
  delta: string;
};

export type ProgressView = {
  period: ProgressPeriod;
  hasHistory: boolean;
  periodTitle: string;
  banner: string;
  exercises: ProgressExerciseItem[];
  improvements: ProgressImprovementItem[];
  workoutsLabel: string;
  rateLabel: string;
  week: { key: string; label: string; active: boolean }[];
  weekLabel: string;
};

export async function getProgress(period: ProgressPeriod, today: LocalDate): Promise<ProgressView> {
  const window = periodWindow(period, today);
  const [sessions, records] = await Promise.all([
    trainContainer.sessions.getCompletedSessionsInRange(EARLIEST_ISO, window.endIso),
    trainContainer.sessions.listCompletedExerciseSets({
      startInclusive: null,
      endExclusive: window.endIso,
    }),
  ]);
  const points = buildSessionPoints(records);
  const periodSessions = sessions.filter((session) => isInWindow(session.completedAt, window.startIso, window.endIso));
  const periodPoints = points.filter((point) => isInWindow(point.completedAt, window.startIso, window.endIso));
  const totals = trainingTotals(periodSessions);
  const spanDays =
    window.spanDays ??
    (periodSessions[0] ? inclusiveSpanDays(periodSessions[0].completedAt, today) : 0);
  const activeDays = activeDateKeys(periodSessions.map((session) => session.completedAt));
  const week = mondayWeek(today).map((date, index) => ({
    key: localDateKey(date),
    label: WEEKDAY_LABELS[index] ?? '',
    active: activeDays.has(localDateKey(date)),
  }));

  return {
    period,
    hasHistory: sessions.length > 0,
    periodTitle: periodTitle(period),
    banner: formatPeriodBanner(totals),
    exercises: exerciseSeries(periodPoints).map(toExerciseItem),
    improvements: recentImprovements(points, window.startIso, window.endIso).map((item) => ({
      exerciseId: item.exerciseId,
      name: item.exerciseName,
      comparison: formatComparison(item.previous, item.latest),
      delta: formatSignedDelta(item.loggingType, item.delta),
    })),
    workoutsLabel: countPhrase(totals.workouts, 'workout'),
    rateLabel: formatWeeklyRate(averageWorkoutsPerWeek(totals.workouts, spanDays)),
    week,
    weekLabel: weekAccessibility(week),
  };
}

export type ExerciseProgressView = {
  name: string;
  currentLabel: string;
  currentValue: string;
  since: string | null;
  sincePositive: boolean;
  firstRecorded: string;
  trend: number[] | null;
  trendLabel: string;
  metrics: { label: string; value: string }[];
  history: { id: string; date: string; performance: string; workoutName: string }[];
};

export async function getExerciseProgress(
  exerciseId: string,
  today: LocalDate,
): Promise<ExerciseProgressView | null> {
  const endIso = periodWindow('all', today).endIso;
  const records = await trainContainer.sessions.listCompletedExerciseSets({
    startInclusive: null,
    endExclusive: endIso,
    exerciseId,
  });
  const series = exerciseSeries(buildSessionPoints(records)).find((item) => item.exerciseId === exerciseId);
  if (!series || series.points.length === 0) {
    return null;
  }
  const first = series.points[0];
  const latest = series.points[series.points.length - 1];
  if (!first || !latest) {
    return null;
  }
  const delta = metricDelta(first.performance, latest.performance);
  const single = series.points.length < 2;
  return {
    name: series.exerciseName,
    currentLabel: currentMetricLabel(series.loggingType),
    currentValue: formatPerformanceValue(latest.performance),
    since: single || delta === null ? null : formatSinceRecorded(series.loggingType, delta),
    sincePositive: (delta ?? 0) > 0,
    firstRecorded: formatFirstRecorded(first.performance),
    trend: single ? null : series.points.map((point) => primaryMetric(point.performance)),
    trendLabel: trendAccessibility(series),
    metrics: [
      { label: 'First recorded', value: formatPerformanceValue(first.performance) },
      { label: 'Current', value: formatPerformanceValue(latest.performance) },
      { label: 'Change', value: delta === null ? 'No change' : formatSignedDelta(series.loggingType, delta) },
      { label: 'Sessions', value: String(series.points.length) },
      { label: 'First', value: formatProgressDate(first.completedAt, today) },
      { label: 'Latest', value: formatProgressDate(latest.completedAt, today) },
    ],
    history: [...series.points].reverse().map((point) => ({
      id: point.sessionId,
      date: formatProgressDate(point.completedAt, today),
      performance: formatHistoryLine(point.performance),
      workoutName: point.sessionName,
    })),
  };
}

function toExerciseItem(series: ExerciseSeries): ProgressExerciseItem {
  const first = series.points[0];
  const latest = series.points[series.points.length - 1];
  if (!first || !latest) {
    return {
      exerciseId: series.exerciseId,
      name: series.exerciseName,
      comparison: null,
      firstRecorded: null,
      delta: null,
      deltaPositive: false,
      sessionsLabel: countPhrase(series.points.length, 'session'),
      trend: null,
      trendLabel: series.exerciseName,
    };
  }
  const single = series.points.length < 2;
  const delta = metricDelta(first.performance, latest.performance);
  return {
    exerciseId: series.exerciseId,
    name: series.exerciseName,
    comparison: single ? null : formatComparison(first.performance, latest.performance),
    firstRecorded: single ? formatFirstRecorded(first.performance) : null,
    delta: single || delta === null ? null : formatSignedDelta(series.loggingType, delta),
    deltaPositive: (delta ?? 0) > 0,
    sessionsLabel: countPhrase(series.points.length, 'session'),
    trend: single ? null : series.points.map((point) => primaryMetric(point.performance)),
    trendLabel: trendAccessibility(series),
  };
}

function trainingTotals(sessions: CompletedSessionInRange[]): {
  workouts: number;
  sets: number;
  durationMinutes: number;
} {
  return {
    workouts: sessions.length,
    sets: sessions.reduce((count, session) => count + session.completedSetCount, 0),
    durationMinutes: sessions.reduce(
      (count, session) => count + elapsedMinutes(session.startedAt, session.completedAt),
      0,
    ),
  };
}

function periodTitle(period: ProgressPeriod): string {
  if (period === '90d') {
    return '90 days';
  }
  if (period === 'all') {
    return 'All time';
  }
  return '30 days';
}

function trendAccessibility(series: ExerciseSeries): string {
  const first = series.points[0];
  const latest = series.points[series.points.length - 1];
  if (!first || !latest) {
    return series.exerciseName;
  }
  return `${series.exerciseName} from ${formatPerformanceValue(first.performance)} to ${formatPerformanceValue(latest.performance)} over ${countPhrase(series.points.length, 'session')}`;
}

function weekAccessibility(week: { label: string; active: boolean }[]): string {
  const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const active = week.flatMap((day, index) => (day.active ? [labels[index] ?? day.label] : []));
  if (active.length === 0) {
    return 'This week. No workouts.';
  }
  return `This week. Workouts on ${active.join(', ')}.`;
}
