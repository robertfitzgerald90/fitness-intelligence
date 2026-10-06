import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  beginSessionDraft,
  getSessionDraft,
  moveDraftExercise,
  updateSessionDraft,
  type SessionDraft,
} from '@/application/train/drafts';
import { getWorkoutTemplate } from '@/application/train/useCases';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { spacing } from '@/design/tokens';
import { ExerciseOrderList } from '@/features/train/ExerciseOrderList';

type Props = {
  templateId: string;
};

export function StartWorkoutScreen({ templateId }: Props) {
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [missing, setMissing] = useState(false);

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
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
});
