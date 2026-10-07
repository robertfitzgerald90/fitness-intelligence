import { elapsedMinutes } from '@/domain/analytics/elapsed';
import { compareWorkingWeight, type ExercisePerformance, type WeightComparison } from '@/domain/analytics/workingWeight';
import type { ExerciseLoggingType } from '@/domain/models/exercise';
import type { StrengthSet } from '@/domain/models/strengthSession';

export function formatWeight(weight: number): string {
  const rounded = Math.round(weight * 100) / 100;
  return rounded.toFixed(2).replace(/\.?0+$/, '');
}

export function formatElapsed(startedAt: string, now: Date): string {
  const started = Date.parse(startedAt);
  if (Number.isNaN(started)) {
    return '0:00';
  }
  const totalSeconds = Math.max(0, Math.floor((now.getTime() - started) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${minutes}:${paddedSeconds}`;
}

export function formatStartedAgo(startedAt: string, now: Date): string {
  const started = Date.parse(startedAt);
  if (Number.isNaN(started)) {
    return 'Started just now';
  }
  const minutes = Math.floor(Math.max(0, now.getTime() - started) / 60000);
  if (minutes < 1) {
    return 'Started just now';
  }
  if (minutes === 1) {
    return 'Started 1 min ago';
  }
  if (minutes < 60) {
    return `Started ${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours === 1) {
    return 'Started 1 hr ago';
  }
  return `Started ${hours} hr ago`;
}

export function formatDuration(startedAt: string, completedAt: string): string {
  const minutes = elapsedMinutes(startedAt, completedAt);
  if (minutes < 1) {
    return 'Less than a minute';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const hourLabel = hours === 1 ? '1 hr' : `${hours} hr`;
  if (remainder === 0) {
    return hourLabel;
  }
  return `${hourLabel} ${remainder} min`;
}

export function formatWorkoutDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export function formatSetLine(weight: number, reps: number): string {
  return `${formatWeight(weight)} lb × ${reps}`;
}

export function formatSetDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function formatLoggedSet(loggingType: ExerciseLoggingType, set: StrengthSet): string | null {
  if (!set.isCompleted) {
    return null;
  }
  if (loggingType === 'duration_weight' && set.durationSeconds != null && set.durationSeconds >= 1) {
    const clock = formatSetDuration(set.durationSeconds);
    return set.weight != null ? `${clock} · ${formatWeight(set.weight)} lb` : clock;
  }
  if (loggingType === 'reps' && set.reps != null && set.reps >= 1) {
    return `${set.reps} reps`;
  }
  if (set.weight != null && set.reps != null && set.reps >= 1) {
    return formatSetLine(set.weight, set.reps);
  }
  if (set.durationSeconds != null && set.durationSeconds >= 1) {
    return formatSetDuration(set.durationSeconds);
  }
  if (set.reps != null && set.reps >= 1) {
    return `${set.reps} reps`;
  }
  return null;
}

export function previousPerformanceLabel(performance: ExercisePerformance | null): string {
  if (!performance) {
    return 'No previous performance';
  }
  if (performance.loggingType === 'reps') {
    return `Last: ${performance.reps} reps`;
  }
  if (performance.loggingType === 'duration_weight') {
    const clock = formatSetDuration(performance.durationSeconds);
    return performance.weight != null ? `Last: ${clock} · ${formatWeight(performance.weight)} lb` : `Last: ${clock}`;
  }
  return `Last: ${formatSetLine(performance.weight, performance.reps)}`;
}

export type SummaryComparison = {
  primary: string;
  secondary: string | null;
  improved: boolean;
};

export function performanceComparison(
  current: ExercisePerformance,
  previous: ExercisePerformance | null,
): SummaryComparison {
  if (!previous || previous.loggingType !== current.loggingType) {
    return { primary: 'First recorded session', secondary: null, improved: false };
  }
  if (current.loggingType === 'reps' && previous.loggingType === 'reps') {
    return compareMeasure(current.reps, previous.reps, 'reps', 'Same reps', 'Fewer reps today');
  }
  if (current.loggingType === 'duration_weight' && previous.loggingType === 'duration_weight') {
    return compareMeasure(
      current.durationSeconds,
      previous.durationSeconds,
      'duration',
      'Same duration',
      'Shorter today',
    );
  }
  if (current.loggingType === 'weight_reps' && previous.loggingType === 'weight_reps') {
    const comparison = compareWorkingWeight(current, previous);
    const copy = comparisonCopy(comparison);
    return { primary: copy.primary, secondary: copy.secondary, improved: comparison.kind === 'up' };
  }
  return { primary: 'First recorded session', secondary: null, improved: false };
}

function compareMeasure(
  current: number,
  previous: number,
  kind: 'reps' | 'duration',
  sameLabel: string,
  lowerLabel: string,
): SummaryComparison {
  if (current === previous) {
    return { primary: sameLabel, secondary: null, improved: false };
  }
  const format = kind === 'duration' ? formatSetDuration : (value: number) => String(value);
  const primary = `${format(previous)} → ${format(current)}`;
  if (current > previous) {
    const delta = current - previous;
    const secondary = kind === 'duration' ? `+${formatSetDuration(delta)}` : `+${delta} reps`;
    return { primary, secondary, improved: true };
  }
  return { primary, secondary: lowerLabel, improved: false };
}

export function comparisonCopy(comparison: WeightComparison): { primary: string; secondary: string | null } {
  switch (comparison.kind) {
    case 'first':
      return { primary: 'First recorded session', secondary: null };
    case 'same':
      return { primary: 'Same working weight', secondary: null };
    case 'up':
      return {
        primary: `${formatWeight(comparison.from)} lb → ${formatWeight(comparison.to)} lb`,
        secondary: `+${formatWeight(comparison.delta)} lb`,
      };
    case 'lower':
      return {
        primary: `${formatWeight(comparison.from)} lb → ${formatWeight(comparison.to)} lb`,
        secondary: 'Lower working weight today',
      };
    default: {
      const exhaustive: never = comparison;
      return exhaustive;
    }
  }
}

export function sanitizeWeightInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) {
    return cleaned;
  }
  const whole = cleaned.slice(0, dot);
  const fraction = cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  return `${whole}.${fraction}`;
}

export function sanitizeRepsInput(text: string): string {
  return text.replace(/[^0-9]/g, '').slice(0, 4);
}

export function parseWeightInput(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') {
    return null;
  }
  const normalized = trimmed.endsWith('.') ? trimmed.slice(0, -1) : trimmed;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const value = Math.round(Number(normalized) * 100) / 100;
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

export function parseRepsInput(text: string): number | null {
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const value = Number(text);
  if (!Number.isInteger(value) || value < 1) {
    return null;
  }
  return value;
}

export function sanitizeDurationInput(text: string): string {
  const cleaned = text.replace(/[^0-9:]/g, '');
  const colon = cleaned.indexOf(':');
  if (colon === -1) {
    return cleaned.slice(0, 4);
  }
  const minutes = cleaned.slice(0, colon).replace(/:/g, '');
  const seconds = cleaned.slice(colon + 1).replace(/:/g, '').slice(0, 2);
  return `${minutes}:${seconds}`;
}

export function parseDurationInput(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '' || trimmed === ':') {
    return null;
  }
  if (trimmed.includes(':')) {
    const [minutesText, secondsText, extra] = trimmed.split(':');
    if (extra != null || minutesText == null || secondsText == null) {
      return null;
    }
    if (!/^\d+$/.test(minutesText) || !/^\d{1,2}$/.test(secondsText)) {
      return null;
    }
    const seconds = Number(secondsText);
    if (seconds >= 60) {
      return null;
    }
    const total = Number(minutesText) * 60 + seconds;
    return total >= 1 ? total : null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  if (trimmed.length <= 2) {
    const total = Number(trimmed);
    return total >= 1 ? total : null;
  }
  const seconds = Number(trimmed.slice(-2));
  if (seconds >= 60) {
    return null;
  }
  const minutes = Number(trimmed.slice(0, -2));
  const total = minutes * 60 + seconds;
  return total >= 1 ? total : null;
}

export function durationToInput(durationSeconds: number | null): string {
  if (durationSeconds == null) {
    return '';
  }
  return formatSetDuration(durationSeconds);
}

export function weightToInput(weight: number | null): string {
  if (weight == null) {
    return '';
  }
  return formatWeight(weight);
}

export function isUsableLoggedSet(
  loggingType: ExerciseLoggingType,
  weight: number | null,
  reps: number | null,
  durationSeconds: number | null,
): boolean {
  if (loggingType === 'reps') {
    return reps != null && reps >= 1;
  }
  if (loggingType === 'duration_weight') {
    return durationSeconds != null && durationSeconds >= 1 && (weight == null || weight >= 0);
  }
  return weight != null && weight >= 0 && reps != null && reps >= 1;
}

export function incompleteSetMessage(loggingType: ExerciseLoggingType): string {
  if (loggingType === 'reps') {
    return 'Enter reps.';
  }
  if (loggingType === 'duration_weight') {
    return 'Enter a duration.';
  }
  return 'Enter a weight and reps.';
}

export function primarySetField(
  loggingType: ExerciseLoggingType,
  weight: number | null,
): 'weight' | 'reps' | 'duration' {
  if (loggingType === 'reps') {
    return 'reps';
  }
  if (loggingType === 'duration_weight') {
    return 'duration';
  }
  return weight == null ? 'weight' : 'reps';
}
