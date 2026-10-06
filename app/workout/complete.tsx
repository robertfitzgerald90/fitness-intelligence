import { Stack, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { WorkoutCompleteScreen } from '@/features/workout/WorkoutCompleteScreen';

export default function WorkoutCompleteRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const id = firstParam(sessionId);

  if (!id) {
    return (
      <>
        <Stack.Screen options={{ title: 'Workout complete' }} />
        <Screen edges={['left', 'right', 'bottom']}>
          <AppText role="body" color="textSecondary">
            This workout is no longer available.
          </AppText>
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Workout complete' }} />
      <WorkoutCompleteScreen sessionId={id} />
    </>
  );
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
