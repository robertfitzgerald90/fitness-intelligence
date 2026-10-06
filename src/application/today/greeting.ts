export function greetingForHour(hour: number, firstName: string): string {
  if (hour < 12) {
    return `Good morning, ${firstName}`;
  }
  if (hour < 17) {
    return `Good afternoon, ${firstName}`;
  }
  return `Good evening, ${firstName}`;
}
