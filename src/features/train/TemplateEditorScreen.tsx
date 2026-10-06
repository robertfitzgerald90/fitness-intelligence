import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import {
  beginEditTemplateDraft,
  beginNewTemplateDraft,
  clearTemplateDraft,
  getTemplateDraft,
  moveDraftExercise,
  updateTemplateDraft,
  type TemplateDraft,
} from '@/application/train/drafts';
import { deleteWorkoutTemplate, getWorkoutTemplate, saveWorkoutTemplate } from '@/application/train/useCases';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import { ExerciseOrderList } from '@/features/train/ExerciseOrderList';

type Props = {
  templateId: string | null;
};

export function TemplateEditorScreen({ templateId }: Props) {
  const [draft, setDraft] = useState<TemplateDraft | null>(null);
  const [missing, setMissing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load(): Promise<void> {
        const current = getTemplateDraft();
        const matches =
          current !== null && (templateId === null ? current.templateId === null : current.templateId === templateId);
        if (matches && current) {
          if (!cancelled) {
            setDraft(current);
            setMissing(false);
          }
          return;
        }
        if (templateId === null) {
          const next = beginNewTemplateDraft();
          if (!cancelled) {
            setDraft(next);
            setMissing(false);
          }
          return;
        }
        const template = await getWorkoutTemplate(templateId);
        if (cancelled) {
          return;
        }
        if (!template) {
          setMissing(true);
          setDraft(null);
          return;
        }
        setDraft(beginEditTemplateDraft(template));
        setMissing(false);
      }
      void load();
      return () => {
        cancelled = true;
      };
    }, [templateId]),
  );

  function commit(next: TemplateDraft): void {
    updateTemplateDraft(next);
    setDraft(next);
    setMessage(null);
  }

  async function save(): Promise<void> {
    if (!draft) {
      return;
    }
    const result = await saveWorkoutTemplate({
      id: draft.templateId,
      name: draft.name,
      exerciseIds: draft.exercises.map((exercise) => exercise.exerciseId),
    });
    if (!result.ok) {
      setMessage('Give this workout a name.');
      return;
    }
    clearTemplateDraft();
    router.back();
  }

  function confirmDelete(): void {
    if (!draft?.templateId) {
      return;
    }
    const id = draft.templateId;
    Alert.alert('Delete this workout?', 'This removes the saved workout.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteWorkoutTemplate(id).then(() => {
            clearTemplateDraft();
            router.back();
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
            <TextField
              label="Name"
              value={draft.name}
              placeholder="Workout name"
              onChangeText={(name) => commit({ ...draft, name })}
            />
            <View style={styles.exercises}>
              <SectionLabel>Exercises</SectionLabel>
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
                onPress={() => router.push({ pathname: '/exercises', params: { purpose: 'template' } })}
              />
            </View>
            {message ? (
              <AppText role="small" color="textSecondary">
                {message}
              </AppText>
            ) : null}
            <PrimaryButton label="Save workout" onPress={() => void save()} />
            {draft.templateId ? (
              <TextAction label="Delete workout" tone="muted" onPress={confirmDelete} />
            ) : null}
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
  exercises: {
    gap: spacing[3],
  },
});
