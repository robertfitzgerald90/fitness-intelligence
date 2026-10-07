import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { formatMonthName } from '@/application/calendar/format';
import { getMonthActivity, type MonthActivityView } from '@/application/calendar/getMonthActivity';
import type { StrengthWorkoutItem } from '@/application/calendar/strengthActivity';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/design/tokens';

type Props = {
  year: number;
  monthIndex: number;
};

export function MonthActivityScreen({ year, monthIndex }: Props) {
  const [view, setView] = useState<MonthActivityView | null>(null);
  const [failed, setFailed] = useState(false);
  const title = `${formatMonthName(year, monthIndex)} activity`;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getMonthActivity(year, monthIndex)
        .then((next) => {
          if (!cancelled) {
            setView(next);
            setFailed(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFailed(true);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [monthIndex, year]),
  );

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {failed ? (
          <AppText role="body" color="textSecondary">
            This month could not be loaded.
          </AppText>
        ) : null}
        {view ? (
          <>
            <AppText role="body" color="textSecondary">
              {view.summary}
            </AppText>
            {view.groups.length === 0 ? (
              <AppText role="body" color="textSecondary">
                No workouts recorded this month.
              </AppText>
            ) : (
              view.groups.map((group) => (
                <View key={group.dateKey} style={styles.group}>
                  <SectionLabel>{group.label}</SectionLabel>
                  {group.workouts.map((workout) => (
                    <WorkoutRow key={workout.id} workout={workout} />
                  ))}
                </View>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function WorkoutRow({ workout }: { workout: StrengthWorkoutItem }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${workout.name}. ${workout.meta}. ${workout.completedLabel}`}
      onPress={() => router.push({ pathname: '/workout/[id]', params: { id: workout.id } })}
      style={({ pressed }) => [styles.workout, pressed && styles.pressed]}
    >
      <AppText role="bodyStrong">{workout.name}</AppText>
      <AppText role="small" color="textSecondary">
        {workout.meta}
      </AppText>
      <AppText role="small" color="textMuted">
        {workout.completedLabel}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  group: {
    gap: spacing[2],
  },
  workout: {
    gap: spacing[1],
    minHeight: 44,
    paddingVertical: spacing[2],
  },
  pressed: {
    opacity: 0.7,
  },
});
