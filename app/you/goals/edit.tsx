import { useLocalSearchParams } from 'expo-router';

import { GoalEditorScreen } from '@/features/you/GoalEditorScreen';

export default function GoalEditRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <GoalEditorScreen goalId={firstParam(id) ?? null} />;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
