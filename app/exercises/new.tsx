import { Stack } from 'expo-router';

import { CustomExerciseScreen } from '@/features/train/CustomExerciseScreen';

export default function NewExerciseRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'New exercise' }} />
      <CustomExerciseScreen />
    </>
  );
}
