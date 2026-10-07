import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, ScrollView, StyleSheet, View } from 'react-native';

import { formatElapsed, previousPerformanceLabel } from '@/application/workout/format';
import {
  addWorkoutSet,
  discardWorkout,
  finishWorkout,
  flushWorkoutWrites,
  getActiveWorkout,
  getPreviousPerformance,
  moveWorkoutExercise,
  removeWorkoutExercise,
  removeWorkoutSet,
} from '@/application/workout/useCases';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextAction } from '@/components/TextAction';
import { spacing } from '@/design/tokens';
import type { StrengthSession, StrengthSessionExercise } from '@/domain/models/strengthSession';
import { ExerciseLogCard } from '@/features/workout/ExerciseLogCard';

export function ActiveWorkoutScreen() {
  const [session, setSession] = useState<StrengthSession | null | undefined>(undefined);
  const [previous, setPrevious] = useState<Record<string, string>>({});
  const [focusSetId, setFocusSetId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const clearFocus = useCallback(() => setFocusSetId(null), []);

  const reload = useCallback(async () => {
    setSession(await getActiveWorkout());
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void getActiveWorkout()
        .then((next) => {
          if (!cancelled) {
            setSession(next);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSession(null);
          }
        });
      return () => {
        cancelled = true;
        void flushWorkoutWrites();
      };
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        void flushWorkoutWrites();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }
    let cancelled = false;
    const current = session;
    void Promise.all(
      current.exercises.map(async (exercise) => {
        const performance = await getPreviousPerformance(
          exercise.exerciseId,
          exercise.loggingType,
          current.id,
          current.startedAt,
        );
        return [exercise.id, previousPerformanceLabel(performance)] as const;
      }),
    ).then((entries) => {
      if (!cancelled) {
        setPrevious(Object.fromEntries(entries));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  function confirmDiscard(): void {
    if (!session) {
      return;
    }
    const id = session.id;
    Alert.alert('Discard this workout?', 'Your logged sets from this workout will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          void discardWorkout(id).then((removed) => {
            if (removed) {
              router.back();
            }
          });
        },
      },
    ]);
  }

  function confirmRemoveExercise(exercise: StrengthSessionExercise): void {
    Alert.alert(`Remove ${exercise.exerciseNameSnapshot}?`, 'Sets logged for this exercise will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void removeWorkoutExercise(exercise.id).then(() => reload());
        },
      },
    ]);
  }

  async function finish(): Promise<void> {
    if (!session || finishing) {
      return;
    }
    setFinishing(true);
    const result = await finishWorkout(session.id);
    if (!result.ok) {
      setFinishing(false);
      setMessage(result.reason === 'no-sets' ? 'Complete a set before finishing.' : 'This workout is no longer active.');
      return;
    }
    router.replace({ pathname: '/workout/complete', params: { sessionId: session.id } });
  }

  if (session === undefined) {
    return <Screen edges={['left', 'right', 'bottom']}>{null}</Screen>;
  }

  if (!session) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <EmptyState title="No workout in progress" message="Start one from a saved workout." />
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <AppText role="title1">{session.name}</AppText>
          <ElapsedTime startedAt={session.startedAt} />
        </View>
        {session.exercises.length === 0 ? (
          <AppText role="body" color="textSecondary">
            Add an exercise to keep going.
          </AppText>
        ) : null}
        {session.exercises.map((exercise, index) => (
          <ExerciseLogCard
            key={exercise.id}
            exercise={exercise}
            previousLabel={previous[exercise.id]}
            editable
            canMoveUp={index > 0}
            canMoveDown={index < session.exercises.length - 1}
            focusSetId={focusSetId}
            onFocusHandled={clearFocus}
            onAddSet={() => {
              void addWorkoutSet(exercise.id).then(async (created) => {
                await reload();
                if (created) {
                  setFocusSetId(created.id);
                }
              });
            }}
            onRemoveSet={(setId) => {
              void removeWorkoutSet(setId).then(() => reload());
            }}
            onMove={(direction) => {
              void moveWorkoutExercise(session.id, index, direction).then(() => reload());
            }}
            onRemoveExercise={() => confirmRemoveExercise(exercise)}
          />
        ))}
        <TextAction
          label="Add exercise"
          onPress={() =>
            router.push({ pathname: '/exercises', params: { purpose: 'logged', sessionId: session.id } })
          }
        />
        {message ? (
          <AppText role="small" color="textSecondary">
            {message}
          </AppText>
        ) : null}
        <View style={styles.finish}>
          <PrimaryButton label="Finish workout" onPress={() => void finish()} />
          <TextAction label="Discard workout" tone="muted" onPress={confirmDiscard} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ElapsedTime({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <AppText role="body" color="textSecondary">
      {formatElapsed(startedAt, now)}
    </AppText>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  header: {
    gap: spacing[1],
  },
  finish: {
    gap: spacing[2],
    marginTop: spacing[2],
  },
});
