import { useLocalSearchParams } from 'expo-router';

import { VitalEntryScreen } from '@/features/you/VitalEntryScreen';

export default function VitalEntryRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <VitalEntryScreen entryId={firstParam(id) ?? null} />;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
