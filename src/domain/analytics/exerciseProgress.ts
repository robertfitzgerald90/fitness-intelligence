import { representativeExercisePerformance, type ExercisePerformance, type WorkingSet } from '@/domain/analytics/workingWeight';
import { addLocalDays, localDateFromIso, localDateKey, localDayStartIso, type LocalDate } from '@/domain/calendar/dates';
import { isExerciseLoggingType, type ExerciseLoggingType } from '@/domain/models/exercise';

export const progressPeriods = ['30d', '90d', 'all'] as const;

export type ProgressPeriod = (typeof progressPeriods)[number];

export type ProgressSetRecord = {
  sessionId: string;
  sessionName: string;
  startedAt: string;
  completedAt: string;
  exerciseId: string;
  exerciseName: string;
  loggingType: string;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  sortOrder: number;
};

export type ExerciseSessionPoint = {
  sessionId: string;
  sessionName: string;
  completedAt: string;
  exerciseId: string;
  exerciseName: string;
  performance: ExercisePerformance;
};

export type ExerciseSeries = {
  exerciseId: string;
  exerciseName: string;
  loggingType: ExerciseLoggingType;
  points: ExerciseSessionPoint[];
  latestAt: string;
};

export type RecentImprovement = {
  exerciseId: string;
  exerciseName: string;
  loggingType: ExerciseLoggingType;
  previous: ExercisePerformance;
  latest: ExercisePerformance;
  delta: number;
  latestAt: string;
};

const PERIOD_LENGTH: Record<Exclude<ProgressPeriod, 'all'>, number> = {
  '30d': 30,
  '90d': 90,
};

export function periodWindow(
  period: ProgressPeriod,
  today: LocalDate,
): { startIso: string | null; endIso: string; spanDays: number | null } {
  const endIso = localDayStartIso(addLocalDays(today, 1));
  if (period === 'all') {
    return { startIso: null, endIso, spanDays: null };
  }
  const spanDays = PERIOD_LENGTH[period];
  return {
    startIso: localDayStartIso(addLocalDays(today, -(spanDays - 1))),
    endIso,
    spanDays,
  };
}

export function isInWindow(completedAt: string, startIso: string | null, endIso: string): boolean {
  if (startIso !== null && completedAt < startIso) {
    return false;
  }
  return completedAt < endIso;
}

export function inclusiveSpanDays(earliestIso: string, today: LocalDate): number {
  const earliest = localDateFromIso(earliestIso);
  if (!earliest) {
    return 1;
  }
  const start = Date.UTC(earliest.year, earliest.monthIndex, earliest.day);
  const end = Date.UTC(today.year, today.monthIndex, today.day);
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export function averageWorkoutsPerWeek(workoutCount: number, spanDays: number): number {
  if (spanDays <= 0) {
    return 0;
  }
  return (workoutCount * 7) / spanDays;
}

export function mondayWeek(today: LocalDate): LocalDate[] {
  const weekday = new Date(today.year, today.monthIndex, today.day).getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const monday = addLocalDays(today, mondayOffset);
  return [0, 1, 2, 3, 4, 5, 6].map((offset) => addLocalDays(monday, offset));
}

export function buildSessionPoints(records: ProgressSetRecord[]): ExerciseSessionPoint[] {
  const groups = new Map<string, ProgressSetRecord[]>();
  for (const record of records) {
    const key = `${record.sessionId}\0${record.exerciseId}`;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  const points: ExerciseSessionPoint[] = [];
  for (const group of groups.values()) {
    const sample = group[0];
    if (!sample) {
      continue;
    }
    const loggingType = isExerciseLoggingType(sample.loggingType) ? sample.loggingType : 'weight_reps';
    const performance = representativeExercisePerformance(loggingType, group.map(toWorkingSet));
    if (!performance) {
      continue;
    }
    points.push({
      sessionId: sample.sessionId,
      sessionName: sample.sessionName,
      completedAt: sample.completedAt,
      exerciseId: sample.exerciseId,
      exerciseName: sample.exerciseName,
      performance,
    });
  }

  points.sort(bySessionTime);
  return points;
}

export function exerciseSeries(points: ExerciseSessionPoint[]): ExerciseSeries[] {
  const grouped = new Map<string, ExerciseSessionPoint[]>();
  for (const point of points) {
    const series = grouped.get(point.exerciseId) ?? [];
    series.push(point);
    grouped.set(point.exerciseId, series);
  }

  const seriesList: ExerciseSeries[] = [];
  for (const [exerciseId, series] of grouped) {
    const ordered = [...series].sort(bySessionTime);
    const latest = ordered[ordered.length - 1];
    if (!latest) {
      continue;
    }
    seriesList.push({
      exerciseId,
      exerciseName: latest.exerciseName,
      loggingType: latest.performance.loggingType,
      points: ordered,
      latestAt: latest.completedAt,
    });
  }

  seriesList.sort((left, right) => {
    const byRecent = right.latestAt.localeCompare(left.latestAt);
    if (byRecent !== 0) {
      return byRecent;
    }
    return left.exerciseName.localeCompare(right.exerciseName) || left.exerciseId.localeCompare(right.exerciseId);
  });
  return seriesList;
}

export function primaryMetric(performance: ExercisePerformance): number {
  if (performance.loggingType === 'weight_reps') {
    return performance.weight;
  }
  if (performance.loggingType === 'reps') {
    return performance.reps;
  }
  return performance.durationSeconds;
}

export function metricDelta(from: ExercisePerformance, to: ExercisePerformance): number | null {
  if (from.loggingType !== to.loggingType) {
    return null;
  }
  if (from.loggingType === 'weight_reps' && to.loggingType === 'weight_reps') {
    return Math.round((to.weight - from.weight) * 100) / 100;
  }
  if (from.loggingType === 'reps' && to.loggingType === 'reps') {
    return to.reps - from.reps;
  }
  if (from.loggingType === 'duration_weight' && to.loggingType === 'duration_weight') {
    return to.durationSeconds - from.durationSeconds;
  }
  return null;
}

export function recentImprovements(
  points: ExerciseSessionPoint[],
  startIso: string | null,
  endIso: string,
  limit = 5,
): RecentImprovement[] {
  const improvements: RecentImprovement[] = [];
  for (const series of exerciseSeries(points)) {
    const latest = series.points[series.points.length - 1];
    const previous = series.points[series.points.length - 2];
    if (!latest || !previous || !isInWindow(latest.completedAt, startIso, endIso)) {
      continue;
    }
    const delta = metricDelta(previous.performance, latest.performance);
    if (delta === null || delta <= 0) {
      continue;
    }
    improvements.push({
      exerciseId: series.exerciseId,
      exerciseName: series.exerciseName,
      loggingType: series.loggingType,
      previous: previous.performance,
      latest: latest.performance,
      delta,
      latestAt: latest.completedAt,
    });
  }
  return improvements.slice(0, limit);
}

export function activeDateKeys(completedAtValues: string[]): Set<string> {
  const keys = new Set<string>();
  for (const completedAt of completedAtValues) {
    const local = localDateFromIso(completedAt);
    if (local) {
      keys.add(localDateKey(local));
    }
  }
  return keys;
}

function toWorkingSet(record: ProgressSetRecord): WorkingSet {
  return {
    weight: record.weight,
    reps: record.reps,
    durationSeconds: record.durationSeconds,
    isCompleted: true,
    sortOrder: record.sortOrder,
  };
}

function bySessionTime(left: ExerciseSessionPoint, right: ExerciseSessionPoint): number {
  const byTime = left.completedAt.localeCompare(right.completedAt);
  if (byTime !== 0) {
    return byTime;
  }
  return left.sessionId.localeCompare(right.sessionId);
}
