import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getProgress, type ProgressExerciseItem, type ProgressView } from '@/application/progress/getProgress';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { colors, spacing } from '@/design/tokens';
import { progressPeriods, type ProgressPeriod } from '@/domain/analytics/exerciseProgress';
import { localDateFromDate } from '@/domain/calendar/dates';
import { CompactTrendChart } from '@/features/today/CompactTrendChart';

const PERIOD_LABELS: Record<ProgressPeriod, string> = {
  '30d': '30D',
  '90d': '90D',
  all: 'ALL',
};

export function ProgressScreen() {
  const [period, setPeriod] = useState<ProgressPeriod>('30d');
  const [view, setView] = useState<ProgressView | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getProgress(period, localDateFromDate(new Date()))
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
    }, [period]),
  );

  const showing = view && view.period === period ? view : null;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppText role="title1">Progress</AppText>
        <View style={styles.periods}>
          {progressPeriods.map((option) => (
            <Chip
              key={option}
              label={PERIOD_LABELS[option]}
              selected={option === period}
              onPress={() => setPeriod(option)}
            />
          ))}
        </View>

        {failed ? (
          <AppText role="body" color="textSecondary">
            Progress could not be loaded.
          </AppText>
        ) : null}

        {showing && !showing.hasHistory ? (
          <AppText role="body" color="textSecondary">
            Complete a workout to start building your progress.
          </AppText>
        ) : null}

        {showing && showing.hasHistory ? (
          <>
            <View style={styles.section}>
              <SectionLabel>{showing.periodTitle}</SectionLabel>
              <AppText role="small" color="textSecondary" style={styles.banner}>
                {showing.banner}
              </AppText>
            </View>

            <View style={styles.section}>
              <SectionLabel>Strength progress</SectionLabel>
              {showing.exercises.length === 0 ? (
                <AppText role="body" color="textSecondary">
                  No workouts in this period.
                </AppText>
              ) : (
                showing.exercises.map((exercise) => (
                  <ExerciseRow key={exercise.exerciseId} exercise={exercise} />
                ))
              )}
            </View>

            <View style={styles.section}>
              <SectionLabel>Recent improvements</SectionLabel>
              {showing.improvements.length === 0 ? (
                <AppText role="body" color="textSecondary">
                  Keep logging workouts to build your progress history.
                </AppText>
              ) : (
                showing.improvements.map((item) => (
                  <Pressable
                    key={item.exerciseId}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}. ${item.comparison}. ${item.delta}`}
                    onPress={() => openExercise(item.exerciseId)}
                    style={({ pressed }) => [styles.improvement, pressed && styles.pressed]}
                  >
                    <AppText role="bodyStrong">{item.name}</AppText>
                    <AppText role="small" color="textSecondary">
                      {item.comparison}
                    </AppText>
                    <AppText role="small" color="positive">
                      {item.delta}
                    </AppText>
                  </Pressable>
                ))
              )}
            </View>

            <View style={styles.section}>
              <SectionLabel>Training</SectionLabel>
              <AppText role="body">{showing.workoutsLabel}</AppText>
              <AppText role="body" color="textSecondary">
                {showing.rateLabel}
              </AppText>
              <AppText role="caption" color="textMuted">
                This week
              </AppText>
              <View accessible accessibilityLabel={showing.weekLabel} style={styles.week}>
                {showing.week.map((day) => (
                  <View key={day.key} style={styles.weekDay}>
                    <AppText role="caption" color="textMuted">
                      {day.label}
                    </AppText>
                    <View style={styles.dotSlot}>{day.active ? <View style={styles.dot} /> : null}</View>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function ExerciseRow({ exercise }: { exercise: ProgressExerciseItem }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${exercise.name}. ${exercise.comparison ?? exercise.firstRecorded ?? ''}. ${exercise.sessionsLabel}`}
      onPress={() => openExercise(exercise.exerciseId)}
      style={({ pressed }) => [styles.exercise, pressed && styles.pressed]}
    >
      <AppText role="bodyStrong">{exercise.name}</AppText>
      {exercise.comparison ? <AppText role="body">{exercise.comparison}</AppText> : null}
      {exercise.firstRecorded ? (
        <AppText role="body" color="textSecondary">
          {exercise.firstRecorded}
        </AppText>
      ) : null}
      {exercise.delta ? (
        <AppText role="small" color={exercise.deltaPositive ? 'positive' : 'textSecondary'}>
          {exercise.delta}
        </AppText>
      ) : null}
      {exercise.trend ? (
        <CompactTrendChart points={exercise.trend} accessibilityLabel={exercise.trendLabel} height={56} />
      ) : null}
      <AppText role="small" color="textMuted">
        {exercise.sessionsLabel}
      </AppText>
    </Pressable>
  );
}

function openExercise(exerciseId: string) {
  router.push({ pathname: '/progress/exercise/[id]', params: { id: exerciseId } });
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  periods: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  section: {
    gap: spacing[3],
  },
  banner: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exercise: {
    gap: spacing[1],
    paddingVertical: spacing[2],
  },
  improvement: {
    gap: spacing[1],
    minHeight: 44,
    paddingVertical: spacing[2],
  },
  pressed: {
    opacity: 0.75,
  },
  week: {
    flexDirection: 'row',
    marginTop: spacing[2],
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[2],
  },
  dotSlot: {
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.strength,
  },
});
