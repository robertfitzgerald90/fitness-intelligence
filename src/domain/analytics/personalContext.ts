import { localDateFromIso, localDateKey, type LocalDate } from '@/domain/calendar/dates';

export function weightDelta(first: number, latest: number): number {
  return Math.round((latest - first) * 100) / 100;
}

export function absoluteDistance(current: number, target: number): number {
  return Math.round(Math.abs(target - current) * 100) / 100;
}

export function countOnDates(completedAtValues: string[], dateKeys: Set<string>): number {
  let count = 0;
  for (const completedAt of completedAtValues) {
    const local = localDateFromIso(completedAt);
    if (local && dateKeys.has(localDateKey(local))) {
      count += 1;
    }
  }
  return count;
}

export function mostCommonLabel(labels: string[]): string | null {
  const counts = new Map<string, { count: number; lastIndex: number }>();
  labels.forEach((label, index) => {
    const name = label.trim();
    if (!name) {
      return;
    }
    const current = counts.get(name) ?? { count: 0, lastIndex: index };
    current.count += 1;
    current.lastIndex = index;
    counts.set(name, current);
  });
  let best: { name: string; count: number; lastIndex: number } | null = null;
  for (const [name, value] of counts) {
    if (
      !best ||
      value.count > best.count ||
      (value.count === best.count && value.lastIndex > best.lastIndex)
    ) {
      best = { name, count: value.count, lastIndex: value.lastIndex };
    }
  }
  return best?.name ?? null;
}

export function frequentExercises(
  entries: { exerciseId: string; exerciseName: string }[],
  limit = 3,
): string[] {
  const grouped = new Map<string, { name: string; count: number }>();
  for (const entry of entries) {
    const current = grouped.get(entry.exerciseId) ?? { name: entry.exerciseName, count: 0 };
    current.count += 1;
    current.name = entry.exerciseName;
    grouped.set(entry.exerciseId, current);
  }
  return [...grouped.values()]
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, limit)
    .map((entry) => entry.name);
}

export function weekDateKeys(days: LocalDate[]): Set<string> {
  return new Set(days.map((day) => localDateKey(day)));
}
