import { Stack } from 'expo-router';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function StartRunScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Start run' }} />
      <PlaceholderScreen
        edges={['left', 'right', 'bottom']}
        body="Run tracking will open here. Distance, time, and pace come in a later update."
      />
    </>
  );
}
