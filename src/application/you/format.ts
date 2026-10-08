import { formatActivityDay } from '@/application/calendar/format';
import { formatSetDuration, formatWeight } from '@/application/workout/format';
import { addLocalDays, localDateFromIso, localDateKey, sameLocalDate, type LocalDate } from '@/domain/calendar/dates';
import type { WeightUnit } from '@/domain/models/body';
import type { ExerciseLoggingType } from '@/domain/models/exercise';

export const MEDICAL_REFERENCE =
  'Fitness Intelligence tracks measurements for personal reference and does not provide medical diagnosis.';

export const DEFAULT_WEIGHT_UNIT: WeightUnit = 'lb';

export function formatMeasuredWeight(weight: number, unit: WeightUnit): string {
  return `${formatWeight(weight)} ${unit}`;
}

export function formatWeightChange(delta: number, unit: WeightUnit): string {
  if (delta === 0) {
    return 'No change since first recorded';
  }
  const sign = delta > 0 ? '+' : '−';
  return `${sign}${formatWeight(Math.abs(delta))} ${unit} since first recorded`;
}

export function formatWeightDistance(distance: number, unit: WeightUnit): string {
  if (distance === 0) {
    return 'At your goal weight.';
  }
  return `${formatWeight(distance)} ${unit} to goal`;
}

export function formatBodyFat(percent: number): string {
  return `${formatWeight(percent)}%`;
}

export function formatBloodPressure(systolic: number, diastolic: number): string {
  return `${systolic} / ${diastolic}`;
}

export function formatPulse(pulse: number): string {
  return `${pulse} bpm`;
}

export function formatHistoryDay(iso: string, today: LocalDate): string {
  const local = localDateFromIso(iso);
  if (!local) {
    return 'Recorded';
  }
  const day = formatActivityDay(local);
  if (local.year === today.year) {
    return day;
  }
  return `${day}, ${local.year}`;
}

export function formatRecordedMoment(iso: string, today: LocalDate): string {
  const date = new Date(iso);
  const time = Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const local = localDateFromIso(iso);
  if (!local) {
    return time || 'Recorded';
  }
  if (sameLocalDate(local, today)) {
    return time ? `Today, ${time}` : 'Today';
  }
  if (sameLocalDate(local, addLocalDays(today, -1))) {
    return time ? `Yesterday, ${time}` : 'Yesterday';
  }
  const day = formatHistoryDay(iso, today);
  return time ? `${day}, ${time}` : day;
}

export function formatLastRecorded(iso: string, today: LocalDate): string {
  const local = localDateFromIso(iso);
  if (local && sameLocalDate(local, today)) {
    return 'Last recorded today';
  }
  if (local && sameLocalDate(local, addLocalDays(today, -1))) {
    return 'Last recorded yesterday';
  }
  return `Last recorded ${formatHistoryDay(iso, today)}`;
}

export function todayDateKey(today: LocalDate): string {
  return localDateKey(today);
}

export function formatStrengthTarget(
  loggingType: ExerciseLoggingType,
  targetWeight: number | null,
  targetReps: number | null,
  targetDurationSeconds: number | null,
  unit: WeightUnit,
): string {
  if (loggingType === 'reps' && targetReps != null) {
    return `${targetReps} reps target`;
  }
  if (loggingType === 'duration_weight' && targetDurationSeconds != null) {
    return `${formatSetDuration(targetDurationSeconds)} target`;
  }
  if (targetWeight != null) {
    return `${formatMeasuredWeight(targetWeight, unit)} target`;
  }
  return 'Target';
}

export function formatStrengthDistance(
  loggingType: ExerciseLoggingType,
  current: number,
  target: number,
  unit: WeightUnit,
): string {
  if (current >= target) {
    return 'At or past your target.';
  }
  const distance = loggingType === 'weight_reps' ? Math.round((target - current) * 100) / 100 : target - current;
  if (loggingType === 'reps') {
    return `${distance} reps to goal`;
  }
  if (loggingType === 'duration_weight') {
    return `${formatSetDuration(distance)} to goal`;
  }
  return `${formatMeasuredWeight(distance, unit)} to goal`;
}

export function formatWeeklyCount(count: number, target: number): string {
  return `${count} of ${target}`;
}
