import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { getGoals, type GoalCard } from '@/application/you/getYou';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';

export function GoalsScreen() {
  const [goals, setGoals] = useState<GoalCard[] | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getGoals(localDateFromDate(new Date()))
        .then((next) => {
          if (!cancelled) {
            setGoals(next);
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
    }, []),
  );

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Goals' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {failed ? (
          <AppText role="body" color="textSecondary">
            Goals could not be loaded.
          </AppText>
        ) : null}
        {goals && goals.length === 0 ? (
          <AppText role="body" color="textSecondary">
            Set a goal when there&apos;s something you want to work toward.
          </AppText>
        ) : null}
        {goals?.map((goal) => (
          <Pressable
            key={goal.id}
            accessibilityRole="button"
            accessibilityLabel={`${goal.title}. ${goal.target}`}
            onPress={() => router.push({ pathname: '/you/goals/edit', params: { id: goal.id } })}
            style={({ pressed }) => [styles.goal, pressed && styles.pressed]}
          >
            <AppText role="caption" color="textMuted">
              {goal.title}
            </AppText>
            <AppText role="title3">{goal.target}</AppText>
            {goal.lines.map((line) => (
              <AppText key={line} role="body" color="textSecondary">
                {line}
              </AppText>
            ))}
          </Pressable>
        ))}
        <PrimaryButton label="Add goal" onPress={() => router.push('/you/goals/edit')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  goal: {
    gap: spacing[1],
    paddingVertical: spacing[2],
  },
  pressed: {
    opacity: 0.75,
  },
});
