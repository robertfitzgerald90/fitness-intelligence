import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { getWorkoutPreview } from '@/application/today/getTodayDashboard';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const workoutId = Array.isArray(id) ? id[0] : id;
  const [preview, setPreview] = useState<{ title: string; meta: string } | null | undefined>(undefined);

  useEffect(() => {
    if (!workoutId) {
      return;
    }
    let cancelled = false;
    getWorkoutPreview(workoutId)
      .then((next) => {
        if (!cancelled) {
          setPreview(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreview(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [workoutId]);

  const title = preview?.title ?? 'Workout';
  const body = preview
    ? `${preview.meta}. The full workout detail comes in a later update.`
    : preview === null
      ? "This workout isn't available."
      : 'Opening this workout.';

  return (
    <>
      <Stack.Screen options={{ title }} />
      <PlaceholderScreen edges={['left', 'right', 'bottom']} body={body} />
    </>
  );
}
