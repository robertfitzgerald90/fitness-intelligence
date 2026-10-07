import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { parseMonthRoute } from '@/domain/calendar/dates';
import { MonthActivityScreen } from '@/features/calendar/MonthActivityScreen';

export default function MonthActivityRoute() {
  const { year, month } = useLocalSearchParams<{ year?: string; month?: string }>();
  const parsed = parseMonthRoute(firstParam(year) ?? '', firstParam(month) ?? '');

  if (!parsed) {
    return <PlaceholderScreen edges={['left', 'right', 'bottom']} body="This month is not available." />;
  }

  return <MonthActivityScreen year={parsed.year} monthIndex={parsed.monthIndex} />;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
