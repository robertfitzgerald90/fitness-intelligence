const DAY_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
] as const;

export function calendarDaysBetween(earlierIso: string, later: Date): number {
  const earlier = new Date(earlierIso);
  const start = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  const end = new Date(later.getFullYear(), later.getMonth(), later.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function daysAgoPhrase(days: number): string {
  if (days <= 0) {
    return 'today';
  }
  if (days === 1) {
    return 'yesterday';
  }
  const label = DAY_WORDS[days] ?? String(days);
  return `${label} days ago`;
}

export function formatSessionDate(iso: string, now: Date): string {
  const days = calendarDaysBetween(iso, now);
  if (days <= 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'long' });
  }
  return `${days} days ago`;
}

export function formatLoadSet(weightLb: number, reps: number): string {
  return `${weightLb} lb × ${reps}`;
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
