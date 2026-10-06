import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import {
  beginSessionDraft,
  clearSessionDraft,
  getSessionDraft,
  moveDraftExercise,
  updateSessionDraft,
  type SessionDraft,
} from '@/application/train/drafts';
import { getWorkoutTemplate } from '@/application/train/useCases';
import { beginWorkout, discardWorkout, getActiveWorkout } from '@/application/workout/useCases';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { spacing } from '@/design/tokens';
import type { StrengthSession } from '@/domain/models/strengthSession';
import { ExerciseOrderList } from '@/features/train/ExerciseOrderList';

type Props = {
  templateId: string;
};

export function StartWorkoutScreen({ templateId }: Props) {
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [missing, setMissing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [conflict, setConflict] = useState<StrengthSession | null>(null);
  const [starting, setStarting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const current = getSessionDraft();
      if (current?.templateId === templateId) {
        setDraft(current);
        setMissing(false);
        return () => {
          cancelled = true;
        };
      }

      void getWorkoutTemplate(templateId).then((template) => {
        if (cancelled) {
          return;
        }
        if (!template) {
          setMissing(true);
          setDraft(null);
          return;
        }
        setDraft(beginSessionDraft(template));
        setMissing(false);
      });

      return () => {
        cancelled = true;
      };
    }, [templateId]),
  );

  function commit(next: SessionDraft): void {
    updateSessionDraft(next);
    setDraft(next);
    setMessage(null);
    setConflict(null);
  }

  async function startNew(current: SessionDraft): Promise<void> {
    let result: Awaited<ReturnType<typeof beginWorkout>>;
    try {
      result = await beginWorkout(current);
    } catch {
      setMessage('This workout could not be started.');
      setStarting(false);
      return;
    }
    if (!result.ok) {
      if (result.reason === 'active') {
        setConflict(await getActiveWorkout());
      } else if (result.reason === 'empty') {
        setMessage('Add an exercise before you begin.');
      }
      setStarting(false);
      return;
    }
    clearSessionDraft();
    setStarting(false);
    router.push('/workout/active');
  }

  async function begin(): Promise<void> {
    if (!draft || starting) {
      return;
    }
    setStarting(true);
    setMessage(null);
    const active = await getActiveWorkout();
    if (active) {
      setConflict(active);
      setStarting(false);
      return;
    }
    await startNew(draft);
  }

  function confirmReplace(): void {
    if (!draft || !conflict) {
      return;
    }
    const current = draft;
    const activeId = conflict.id;
    Alert.alert('Discard this workout?', 'Your logged sets from this workout will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          setStarting(true);
          void discardWorkout(activeId).then(async (removed) => {
            if (!removed) {
              setStarting(false);
              setConflict(await getActiveWorkout());
              return;
            }
            setConflict(null);
            await startNew(current);
          });
        },
      },
    ]);
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {missing ? (
          <AppText role="body" color="textSecondary">
            This workout is no longer available.
          </AppText>
        ) : null}
        {draft ? (
          <>
            <View style={styles.header}>
              <SectionLabel>Ready to begin</SectionLabel>
              <AppText role="title1">{draft.name}</AppText>
              <AppText role="body" color="textSecondary">
                Adjust this list for today. Your saved workout stays the same.
              </AppText>
            </View>
            <ExerciseOrderList
              exercises={draft.exercises}
              onMove={(index, direction) => commit(moveDraftExercise(draft, index, direction))}
              onRemove={(index) =>
                commit({
                  ...draft,
                  exercises: draft.exercises.filter((_, exerciseIndex) => exerciseIndex !== index),
                })
              }
            />
            <TextAction
              label="Add exercise"
              onPress={() => router.push({ pathname: '/exercises', params: { purpose: 'session' } })}
            />
            {message ? (
              <AppText role="small" color="textSecondary">
                {message}
              </AppText>
            ) : null}
            {conflict ? (
              <View style={styles.conflict}>
                <AppText role="title3">Workout in progress</AppText>
                <AppText role="body" color="textSecondary">
                  {`${conflict.name} is still open.`}
                </AppText>
                <TextAction label="Resume workout" onPress={() => router.push('/workout/active')} />
                <TextAction label="Discard and start new" tone="muted" onPress={confirmReplace} />
              </View>
            ) : (
              <PrimaryButton label="Begin workout" onPress={() => void begin()} />
            )}
          </>
        ) : null}
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
  header: {
    gap: spacing[2],
  },
  conflict: {
    gap: spacing[2],
  },
});
