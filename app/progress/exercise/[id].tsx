import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { ExerciseProgressScreen } from '@/features/progress/ExerciseProgressScreen';

export default function ExerciseProgressRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const exerciseId = firstParam(id);

  if (!exerciseId) {
    return <PlaceholderScreen edges={['left', 'right', 'bottom']} body="This exercise is not available." />;
  }

  return <ExerciseProgressScreen exerciseId={exerciseId} />;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
