import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  beginEditTemplateDraft,
  beginNewTemplateDraft,
  beginSessionDraft,
} from '@/application/train/drafts';
import { getWorkoutTemplate, listWorkoutTemplates } from '@/application/train/useCases';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { spacing } from '@/design/tokens';
import type { WorkoutTemplateSummary } from '@/domain/models/workoutTemplate';

export function TrainScreen() {
  const [templates, setTemplates] = useState<WorkoutTemplateSummary[] | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      listWorkoutTemplates()
        .then((next) => {
          if (!cancelled) {
            setTemplates(next);
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
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText role="title1">Train</AppText>
          <AppText role="body" color="textSecondary">
            What do you want to train?
          </AppText>
        </View>
        <SectionLabel>Saved workouts</SectionLabel>
        {failed ? (
          <EmptyState title="Train is unavailable" message="Saved workouts could not load right now." />
        ) : null}
        {templates && templates.length === 0 ? (
          <EmptyState
            title="Create your first workout."
            message="A workout is the list of exercises you want to repeat."
          />
        ) : null}
        {templates?.map((template) => (
          <Card key={template.id}>
            <AppText role="title2">{template.name}</AppText>
            <AppText role="small" color="textSecondary">
              {exerciseCountLabel(template.exerciseCount)}
            </AppText>
            <View style={styles.actions}>
              <TextAction
                label="Edit"
                tone="muted"
                accessibilityLabel={`Edit ${template.name}`}
                onPress={() => {
                  void openTemplateEditor(template.id);
                }}
              />
              <TextAction
                label="Start"
                accessibilityLabel={`Start ${template.name}`}
                onPress={() => {
                  void startTemplate(template.id);
                }}
              />
            </View>
          </Card>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create workout"
          onPress={() => {
            beginNewTemplateDraft();
            router.push('/template/new');
          }}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Card>
            <AppText role="title3">Create workout</AppText>
          </Card>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

async function openTemplateEditor(id: string): Promise<void> {
  const template = await getWorkoutTemplate(id);
  if (!template) {
    return;
  }
  beginEditTemplateDraft(template);
  router.push({ pathname: '/template/[id]', params: { id } });
}

async function startTemplate(id: string): Promise<void> {
  const template = await getWorkoutTemplate(id);
  if (!template) {
    return;
  }
  beginSessionDraft(template);
  router.push({ pathname: '/workout/start', params: { templateId: id, title: template.name } });
}

function exerciseCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'exercise' : 'exercises'}`;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  header: {
    gap: spacing[1],
    paddingTop: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  pressed: {
    opacity: 0.92,
  },
});
