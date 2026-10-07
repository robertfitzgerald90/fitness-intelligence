import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getExerciseProgress, type ExerciseProgressView } from '@/application/progress/getProgress';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';
import { CompactTrendChart } from '@/features/today/CompactTrendChart';

type Props = {
  exerciseId: string;
};

export function ExerciseProgressScreen({ exerciseId }: Props) {
  const [view, setView] = useState<ExerciseProgressView | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getExerciseProgress(exerciseId, localDateFromDate(new Date()))
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
    }, [exerciseId]),
  );

  if (failed) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ title: 'Progress' }} />
        <AppText role="body" color="textSecondary">
          Progress could not be loaded.
        </AppText>
      </Screen>
    );
  }

  if (view === undefined) {
    return <Screen edges={['left', 'right', 'bottom']}>{null}</Screen>;
  }

  if (!view) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ title: 'Progress' }} />
        <AppText role="body" color="textSecondary">
          This exercise has no recorded progress.
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: view.name }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText role="small" color="textMuted">
            {view.currentLabel}
          </AppText>
          <AppText role="title1">{view.currentValue}</AppText>
          {view.since ? (
            <AppText role="body" color={view.sincePositive ? 'positive' : 'textSecondary'}>
              {view.since}
            </AppText>
          ) : (
            <AppText role="body" color="textSecondary">
              {view.firstRecorded}
            </AppText>
          )}
        </View>

        {view.trend ? <CompactTrendChart points={view.trend} accessibilityLabel={view.trendLabel} height={120} /> : null}

        <View style={styles.metrics}>
          {view.metrics.map((metric) => (
            <View key={metric.label} style={styles.metric}>
              <AppText role="small" color="textMuted">
                {metric.label}
              </AppText>
              <AppText role="body">{metric.value}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.history}>
          <SectionLabel>History</SectionLabel>
          {view.history.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <AppText role="small" color="textMuted">
                {entry.date}
              </AppText>
              <AppText role="bodyStrong">{entry.performance}</AppText>
              <AppText role="small" color="textSecondary">
                {entry.workoutName}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  header: {
    gap: spacing[1],
  },
  metrics: {
    gap: spacing[3],
  },
  metric: {
    gap: spacing[1],
  },
  history: {
    gap: spacing[4],
  },
  entry: {
    gap: spacing[1],
  },
});
