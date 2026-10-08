import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { navigationTheme } from '@/design/theme';
import { colors } from '@/design/tokens';

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workout/start" options={{ title: 'Start workout' }} />
        <Stack.Screen name="workout/active" options={{ title: 'Workout' }} />
        <Stack.Screen name="workout/complete" options={{ title: 'Workout complete' }} />
        <Stack.Screen name="workout/[id]" options={{ title: 'Workout' }} />
        <Stack.Screen name="template/new" options={{ title: 'New workout' }} />
        <Stack.Screen name="template/[id]" options={{ title: 'Edit workout' }} />
        <Stack.Screen name="exercises/index" options={{ title: 'Exercises' }} />
        <Stack.Screen name="exercises/new" options={{ title: 'New exercise' }} />
        <Stack.Screen name="run/start" options={{ title: 'Start run' }} />
        <Stack.Screen name="progress/strength" options={{ title: 'Strength' }} />
        <Stack.Screen name="progress/exercise/[id]" options={{ title: 'Progress' }} />
        <Stack.Screen name="goals/index" options={{ title: 'Goals' }} />
        <Stack.Screen name="calendar/[year]/[month]" options={{ title: 'Activity' }} />
        <Stack.Screen name="you/body" options={{ title: 'Body' }} />
        <Stack.Screen name="you/body/entry" options={{ title: 'Weight' }} />
        <Stack.Screen name="you/vitals" options={{ title: 'Vitals' }} />
        <Stack.Screen name="you/vitals/entry" options={{ title: 'Blood pressure' }} />
        <Stack.Screen name="you/goals" options={{ title: 'Goals' }} />
        <Stack.Screen name="you/goals/edit" options={{ title: 'Goal' }} />
        <Stack.Screen name="you/profile" options={{ title: 'Fitness Profile' }} />
        <Stack.Screen name="you/settings" options={{ title: 'Settings & data' }} />
      </Stack>
    </ThemeProvider>
  );
}
