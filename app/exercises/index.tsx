import { Stack, useLocalSearchParams } from 'expo-router';

import { ExerciseLibraryScreen } from '@/features/train/ExerciseLibraryScreen';

export default function ExerciseLibraryRoute() {
  const { purpose } = useLocalSearchParams<{ purpose?: string }>();
  const mode = firstParam(purpose) === 'session' ? 'session' : 'template';

  return (
    <>
      <Stack.Screen options={{ title: 'Exercises' }} />
      <ExerciseLibraryScreen purpose={mode} />
    </>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
