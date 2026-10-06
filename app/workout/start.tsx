import { Stack, useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { StartWorkoutScreen } from '@/features/train/StartWorkoutScreen';

export default function StartWorkoutRoute() {
  const params = useLocalSearchParams<{ title?: string; duration?: string; templateId?: string }>();
  const templateId = firstParam(params.templateId);
  const title = firstParam(params.title) ?? 'Workout';
  const duration = firstParam(params.duration);
  const session = duration ? `${title} · ${duration} min` : title;

  if (!templateId) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <PlaceholderScreen
          edges={['left', 'right', 'bottom']}
          body={`${session} will open here. Logging sets comes in a later update.`}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title }} />
      <StartWorkoutScreen templateId={templateId} />
    </>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
