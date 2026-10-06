import { Stack, useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function StartWorkoutScreen() {
  const { title, duration } = useLocalSearchParams<{ title?: string; duration?: string }>();
  const sessionTitle = firstParam(title) ?? 'Workout';
  const sessionDuration = firstParam(duration);
  const session = sessionDuration ? `${sessionTitle} · ${sessionDuration} min` : sessionTitle;

  return (
    <>
      <Stack.Screen options={{ title: sessionTitle }} />
      <PlaceholderScreen
        edges={['left', 'right', 'bottom']}
        body={`${session} will open here. Logging sets comes in a later update.`}
      />
    </>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
