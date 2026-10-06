export function atDaysAgo(now: Date, daysAgo: number, hour: number): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, 0, 0, 0);
  return date.toISOString();
}
