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
        <Stack.Screen name="workout/[id]" options={{ title: 'Workout' }} />
        <Stack.Screen name="template/new" options={{ title: 'New workout' }} />
        <Stack.Screen name="template/[id]" options={{ title: 'Edit workout' }} />
        <Stack.Screen name="exercises/index" options={{ title: 'Exercises' }} />
        <Stack.Screen name="exercises/new" options={{ title: 'New exercise' }} />
        <Stack.Screen name="run/start" options={{ title: 'Start run' }} />
        <Stack.Screen name="progress/strength" options={{ title: 'Strength' }} />
        <Stack.Screen name="goals/index" options={{ title: 'Goals' }} />
      </Stack>
    </ThemeProvider>
  );
}
