import { useLocalSearchParams } from 'expo-router';

import { BodyEntryScreen } from '@/features/you/BodyEntryScreen';

export default function BodyEntryRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <BodyEntryScreen entryId={firstParam(id) ?? null} />;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
