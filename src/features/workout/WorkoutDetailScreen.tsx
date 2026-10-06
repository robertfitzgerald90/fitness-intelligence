import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import { getWorkoutPreview } from '@/application/today/getTodayDashboard';
import { formatDuration, formatWorkoutDate } from '@/application/workout/format';
import {
  addWorkoutSet,
  flushWorkoutWrites,
  getWorkoutSession,
  moveWorkoutExercise,
  removeWorkoutExercise,
  removeWorkoutSet,
  renameWorkout,
} from '@/application/workout/useCases';
import { AppText } from '@/components/AppText';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { Screen } from '@/components/Screen';
import { TextAction } from '@/components/TextAction';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import type { StrengthSession, StrengthSessionExercise } from '@/domain/models/strengthSession';
import { ExerciseLogCard } from '@/features/workout/ExerciseLogCard';

type Props = {
  workoutId: string;
};

export function WorkoutDetailScreen({ workoutId }: Props) {
  const [session, setSession] = useState<StrengthSession | null | undefined>(undefined);
  const [seedPreview, setSeedPreview] = useState<{ title: string; meta: string } | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const editingRef = useRef(false);
  const [name, setName] = useState('');
  const [nameMessage, setNameMessage] = useState<string | null>(null);

  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  const reload = useCallback(async () => {
    const next = await getWorkoutSession(workoutId);
    setSession(next);
    return next;
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      function loadSeedPreview(): void {
        void getWorkoutPreview(workoutId)
          .then((preview) => {
            if (!cancelled) {
              setSeedPreview(preview);
            }
          })
          .catch(() => {
            if (!cancelled) {
              setSeedPreview(null);
            }
          });
      }
      void getWorkoutSession(workoutId)
        .then((next) => {
          if (cancelled) {
            return;
          }
          setSession(next);
          if (next) {
            if (!editingRef.current) {
              setName(next.name);
            }
            return;
          }
          loadSeedPreview();
        })
        .catch(() => {
          if (cancelled) {
            return;
          }
          setSession(null);
          loadSeedPreview();
        });
      return () => {
        cancelled = true;
      };
    }, [workoutId]),
  );

  useEffect(() => {
    if (session?.status === 'active') {
      router.replace('/workout/active');
    }
  }, [session]);

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

  async function saveName(): Promise<void> {
    if (!session) {
      return;
    }
    const result = await renameWorkout(session.id, name);
    if (!result.ok) {
      setName(session.name);
      setNameMessage('Give this workout a name.');
      return;
    }
    setName(name.trim());
    setNameMessage(null);
    await reload();
  }

  if (session === undefined || session?.status === 'active' || (session === null && seedPreview === undefined)) {
    return <Screen edges={['left', 'right', 'bottom']}>{null}</Screen>;
  }

  if (!session || !session.completedAt) {
    const title = seedPreview?.title ?? 'Workout';
    const body = seedPreview
      ? `${seedPreview.meta}. The full workout detail comes in a later update.`
      : 'This workout is not available.';
    return (
      <>
        <Stack.Screen options={{ title }} />
        <PlaceholderScreen edges={['left', 'right', 'bottom']} body={body} />
      </>
    );
  }

  const completed = session;
  const completedAt = session.completedAt;

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: completed.name }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {editing ? (
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            onEndEditing={() => {
              void saveName();
            }}
          />
        ) : (
          <AppText role="title1">{completed.name}</AppText>
        )}
        <AppText role="body" color="textSecondary">
          {`${formatWorkoutDate(completedAt)} · ${formatDuration(completed.startedAt, completedAt)}`}
        </AppText>
        {nameMessage ? (
          <AppText role="small" color="textSecondary">
            {nameMessage}
          </AppText>
        ) : null}
        {completed.exercises.map((exercise, index) => (
          <ExerciseLogCard
            key={exercise.id}
            exercise={exercise}
            editable={editing}
            canMoveUp={index > 0}
            canMoveDown={index < completed.exercises.length - 1}
            onAddSet={() => {
              void addWorkoutSet(exercise.id).then(() => reload());
            }}
            onRemoveSet={(setId) => {
              void removeWorkoutSet(setId).then(() => reload());
            }}
            onMove={(direction) => {
              void moveWorkoutExercise(completed.id, index, direction).then(() => reload());
            }}
            onRemoveExercise={() => confirmRemoveExercise(exercise)}
          />
        ))}
        {editing ? (
          <TextAction
            label="Add exercise"
            onPress={() =>
              router.push({ pathname: '/exercises', params: { purpose: 'logged', sessionId: completed.id } })
            }
          />
        ) : null}
        {!editing && completed.exercises.length === 0 ? (
          <AppText role="body" color="textSecondary">
            No exercises were kept for this workout.
          </AppText>
        ) : null}
        <TextAction
          label={editing ? 'Done' : 'Edit'}
          onPress={() => {
            if (!editing) {
              setEditing(true);
              return;
            }
            void flushWorkoutWrites().then(() => reload().then(() => setEditing(false)));
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
});
