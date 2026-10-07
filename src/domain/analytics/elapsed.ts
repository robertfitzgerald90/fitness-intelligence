export function elapsedMinutes(startedAt: string, endedAt: string): number {
  const started = Date.parse(startedAt);
  const ended = Date.parse(endedAt);
  if (Number.isNaN(started) || Number.isNaN(ended)) {
    return 0;
  }
  return Math.round(Math.max(0, ended - started) / 60000);
}
