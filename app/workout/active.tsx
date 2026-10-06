import { Stack } from 'expo-router';

import { ActiveWorkoutScreen } from '@/features/workout/ActiveWorkoutScreen';

export default function ActiveWorkoutRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Workout' }} />
      <ActiveWorkoutScreen />
    </>
  );
}
