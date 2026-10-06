import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { comparisonCopy, formatDuration, formatSetLine } from '@/application/workout/format';
import { getWorkoutSummary, type WorkoutSummary } from '@/application/workout/useCases';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { spacing } from '@/design/tokens';

type Props = {
  sessionId: string;
};

export function WorkoutCompleteScreen({ sessionId }: Props) {
  const [summary, setSummary] = useState<WorkoutSummary | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void getWorkoutSummary(sessionId).then((next) => {
      if (!cancelled) {
        setSummary(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {summary === null ? (
          <AppText role="body" color="textSecondary">
            This workout is no longer available.
          </AppText>
        ) : null}
        {summary ? (
          <>
            <View style={styles.header}>
              <SectionLabel>Workout complete</SectionLabel>
              <AppText role="title1">{summary.name}</AppText>
              <AppText role="body" color="textSecondary">
                {`${formatDuration(summary.startedAt, summary.completedAt)} · ${countLabel(summary.exerciseCount, 'exercise')} · ${countLabel(summary.setCount, 'set')}`}
              </AppText>
            </View>
            {summary.exercises.map((exercise) => {
              const comparison = comparisonCopy(exercise.comparison);
              return (
                <View key={exercise.id} style={styles.exercise}>
                  <AppText role="title3">{exercise.name}</AppText>
                  {exercise.sets.map((set) => (
                    <AppText key={set.id} role="body">
                      {formatSetLine(set.weight, set.reps)}
                    </AppText>
                  ))}
                  <AppText role="small" color="textSecondary">
                    {comparison.primary}
                  </AppText>
                  {comparison.secondary ? (
                    <AppText
                      role="small"
                      color={exercise.comparison.kind === 'up' ? 'positive' : 'textSecondary'}
                    >
                      {comparison.secondary}
                    </AppText>
                  ) : null}
                </View>
              );
            })}
            <View style={styles.actions}>
              <TextAction
                label="View workout"
                onPress={() => router.push({ pathname: '/workout/[id]', params: { id: summary.id } })}
              />
              <TextAction label="Done" tone="muted" onPress={() => router.navigate('/(tabs)/train')} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function countLabel(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  header: {
    gap: spacing[2],
  },
  exercise: {
    gap: spacing[1],
  },
  actions: {
    gap: spacing[1],
  },
});
