import { Stack, useLocalSearchParams } from 'expo-router';

import { ExerciseLibraryScreen } from '@/features/train/ExerciseLibraryScreen';

export default function ExerciseLibraryRoute() {
  const params = useLocalSearchParams<{ purpose?: string; sessionId?: string }>();
  const purpose = firstParam(params.purpose);
  const mode = purpose === 'session' ? 'session' : purpose === 'logged' ? 'logged' : 'template';

  return (
    <>
      <Stack.Screen options={{ title: 'Exercises' }} />
      <ExerciseLibraryScreen purpose={mode} sessionId={firstParam(params.sessionId) ?? null} />
    </>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
