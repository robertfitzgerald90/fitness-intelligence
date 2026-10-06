import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { WorkoutDetailScreen } from '@/features/workout/WorkoutDetailScreen';

export default function WorkoutDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const workoutId = firstParam(id);

  if (!workoutId) {
    return <PlaceholderScreen edges={['left', 'right', 'bottom']} body="This workout is not available." />;
  }

  return <WorkoutDetailScreen workoutId={workoutId} />;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
