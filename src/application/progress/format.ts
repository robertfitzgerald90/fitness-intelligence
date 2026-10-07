import { formatActivityDay } from '@/application/calendar/format';
import { formatSetDuration, formatWeight } from '@/application/workout/format';
import type { ExercisePerformance } from '@/domain/analytics/workingWeight';
import { localDateFromIso, type LocalDate } from '@/domain/calendar/dates';
import type { ExerciseLoggingType } from '@/domain/models/exercise';

export function formatPeriodBanner(input: { workouts: number; sets: number; durationMinutes: number }): string {
  return `${countPhrase(input.workouts, 'workout')}  |  ${countPhrase(input.sets, 'set')}  |  ${formatCompactHours(input.durationMinutes)}`;
}

export function formatWeeklyRate(workoutsPerWeek: number): string {
  return `${workoutsPerWeek.toFixed(1)} workouts / week`;
}

export function formatComparison(from: ExercisePerformance, to: ExercisePerformance): string {
  if (from.loggingType === 'reps' && to.loggingType === 'reps') {
    return `${from.reps} → ${to.reps} reps`;
  }
  if (from.loggingType === 'duration_weight' && to.loggingType === 'duration_weight') {
    return `${formatSetDuration(from.durationSeconds)} → ${formatSetDuration(to.durationSeconds)}`;
  }
  if (from.loggingType === 'weight_reps' && to.loggingType === 'weight_reps') {
    return `${formatWeight(from.weight)} lb → ${formatWeight(to.weight)} lb`;
  }
  return `${formatPerformanceValue(from)} → ${formatPerformanceValue(to)}`;
}

export function formatSignedDelta(loggingType: ExerciseLoggingType, delta: number): string {
  if (delta === 0) {
    return 'No change';
  }
  const sign = delta > 0 ? '+' : '−';
  const magnitude = Math.abs(delta);
  if (loggingType === 'weight_reps') {
    return `${sign}${formatWeight(magnitude)} lb`;
  }
  if (loggingType === 'reps') {
    return `${sign}${magnitude} reps`;
  }
  return `${sign}${formatSetDuration(magnitude)}`;
}

export function formatSinceRecorded(loggingType: ExerciseLoggingType, delta: number): string {
  if (delta === 0) {
    return 'No change since first recorded';
  }
  return `${formatSignedDelta(loggingType, delta)} since first recorded`;
}

export function formatFirstRecorded(performance: ExercisePerformance): string {
  return `First recorded: ${formatPerformanceValue(performance)}`;
}

export function formatPerformanceValue(performance: ExercisePerformance): string {
  if (performance.loggingType === 'weight_reps') {
    return `${formatWeight(performance.weight)} lb`;
  }
  if (performance.loggingType === 'reps') {
    return `${performance.reps} reps`;
  }
  return formatSetDuration(performance.durationSeconds);
}

export function formatHistoryLine(performance: ExercisePerformance): string {
  if (performance.loggingType === 'weight_reps') {
    return `${formatWeight(performance.weight)} lb × ${performance.reps}`;
  }
  if (performance.loggingType === 'reps') {
    return `${performance.reps} reps`;
  }
  const duration = formatSetDuration(performance.durationSeconds);
  if (performance.weight == null) {
    return duration;
  }
  return `${duration} · ${formatWeight(performance.weight)} lb`;
}

export function formatProgressDate(iso: string, today: LocalDate): string {
  const local = localDateFromIso(iso);
  if (!local) {
    return '';
  }
  const day = formatActivityDay(local);
  if (local.year === today.year) {
    return day;
  }
  return `${day}, ${local.year}`;
}

export function currentMetricLabel(loggingType: ExerciseLoggingType): string {
  if (loggingType === 'reps') {
    return 'Current reps';
  }
  if (loggingType === 'duration_weight') {
    return 'Current duration';
  }
  return 'Current working weight';
}

export function countPhrase(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function formatCompactHours(totalMinutes: number): string {
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
