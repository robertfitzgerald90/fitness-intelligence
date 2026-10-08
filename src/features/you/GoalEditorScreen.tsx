import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  deleteGoal,
  goalDraftFrom,
  loadGoal,
  loadGoalExercises,
  saveGoal,
} from '@/application/you/getYou';
import { sanitizeDurationInput, sanitizeRepsInput, sanitizeWeightInput } from '@/application/workout/format';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextAction } from '@/components/TextAction';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import type { Exercise, ExerciseLoggingType } from '@/domain/models/exercise';

type GoalKind = 'body_weight' | 'strength' | 'training_frequency';

const TYPES: { type: GoalKind; label: string }[] = [
  { type: 'body_weight', label: 'Body weight' },
  { type: 'strength', label: 'Strength' },
  { type: 'training_frequency', label: 'Frequency' },
];

type Props = {
  goalId: string | null;
};

export function GoalEditorScreen({ goalId }: Props) {
  const [type, setType] = useState<GoalKind>('body_weight');
  const [targetWeight, setTargetWeight] = useState('');
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [loggingType, setLoggingType] = useState<ExerciseLoggingType>('weight_reps');
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [targetReps, setTargetReps] = useState('');
  const [targetDuration, setTargetDuration] = useState('');
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState('3');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lockedType, setLockedType] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoalExercises()
      .then((next) => {
        if (!cancelled) {
          setExercises(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage('Exercises could not be loaded.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!goalId) {
      return;
    }
    let cancelled = false;
    loadGoal(goalId)
      .then((goal) => {
        if (cancelled) {
          return;
        }
        const draft = goal ? goalDraftFrom(goal) : null;
        if (!draft) {
          setMissing(true);
          return;
        }
        setLockedType(true);
        setType(draft.type);
        if (draft.type === 'body_weight') {
          setTargetWeight(draft.targetWeight);
        } else if (draft.type === 'training_frequency') {
          setWorkoutsPerWeek(draft.workoutsPerWeek);
        } else {
          setExerciseId(draft.exerciseId);
          setLoggingType(draft.loggingType);
          setTargetWeight(draft.targetWeight);
          setTargetReps(draft.targetReps);
          setTargetDuration(draft.targetDuration);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMissing(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [goalId]);

  const selected = exercises.find((exercise) => exercise.id === exerciseId) ?? null;
  const activeLoggingType = selected?.loggingType ?? loggingType;
  const visibleExercises = useMemo(() => {
    const query = exerciseQuery.trim().toLowerCase();
    if (!query) {
      return exercises;
    }
    return exercises.filter((exercise) => exercise.name.toLowerCase().includes(query));
  }, [exerciseQuery, exercises]);

  async function save() {
    if (saving) {
      return;
    }
    setSaving(true);
    try {
      const result = await saveGoal({
        id: goalId,
        type,
        targetWeightText: targetWeight,
        exerciseId,
        targetRepsText: targetReps,
        targetDurationText: targetDuration,
        workoutsPerWeekText: workoutsPerWeek,
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.back();
    } catch {
      setMessage('This goal could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!goalId) {
      return;
    }
    Alert.alert('Delete this goal?', 'Progress toward it will no longer be shown.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteGoal(goalId)
            .then(() => router.back())
            .catch(() => setMessage('This goal could not be deleted.'));
        },
      },
    ]);
  }

  if (missing) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ title: 'Goal' }} />
        <AppText role="body" color="textSecondary" style={styles.missing}>
          This goal is not available.
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: goalId ? 'Edit goal' : 'Add goal' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {lockedType ? (
          <AppText role="body" color="textSecondary">
            {TYPES.find((option) => option.type === type)?.label}
          </AppText>
        ) : (
          <View style={styles.types}>
            {TYPES.map((option) => (
              <Chip
                key={option.type}
                label={option.label}
                selected={option.type === type}
                onPress={() => {
                  setType(option.type);
                  setMessage(null);
                }}
              />
            ))}
          </View>
        )}

        {type === 'body_weight' ? (
          <TextField
            label="Target weight (lb)"
            value={targetWeight}
            onChangeText={(value) => setTargetWeight(sanitizeWeightInput(value))}
            keyboardType="decimal-pad"
            autoCapitalize="none"
          />
        ) : null}

        {type === 'training_frequency' ? (
          <TextField
            label="Workouts per week"
            value={workoutsPerWeek}
            onChangeText={(value) => setWorkoutsPerWeek(sanitizeRepsInput(value))}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
        ) : null}

        {type === 'strength' ? (
          <>
            <TextField
              label="Exercise"
              value={exerciseQuery}
              onChangeText={setExerciseQuery}
              placeholder="Search"
              autoCapitalize="none"
            />
            {selected ? <AppText role="bodyStrong">{selected.name}</AppText> : null}
            <View>
              {visibleExercises.map((exercise) => (
                <Pressable
                  key={exercise.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: exercise.id === exerciseId }}
                  onPress={() => {
                    setExerciseId(exercise.id);
                    setLoggingType(exercise.loggingType);
                  }}
                  style={({ pressed }) => [styles.exercise, pressed && styles.pressed]}
                >
                  <AppText role="body" color={exercise.id === exerciseId ? 'primary' : 'textPrimary'}>
                    {exercise.name}
                  </AppText>
                </Pressable>
              ))}
            </View>
            {selected || goalId ? (
              <>
                {activeLoggingType === 'reps' ? (
                  <TextField
                    label="Target reps"
                    value={targetReps}
                    onChangeText={(value) => setTargetReps(sanitizeRepsInput(value))}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                  />
                ) : null}
                {activeLoggingType === 'duration_weight' ? (
                  <TextField
                    label="Target duration"
                    value={targetDuration}
                    onChangeText={(value) => setTargetDuration(sanitizeDurationInput(value))}
                    placeholder="2:00"
                    autoCapitalize="none"
                  />
                ) : null}
                {activeLoggingType === 'weight_reps' ? (
                  <TextField
                    label="Target weight (lb)"
                    value={targetWeight}
                    onChangeText={(value) => setTargetWeight(sanitizeWeightInput(value))}
                    keyboardType="decimal-pad"
                    autoCapitalize="none"
                  />
                ) : null}
              </>
            ) : null}
          </>
        ) : null}

        {message ? (
          <AppText role="small" color="textSecondary">
            {message}
          </AppText>
        ) : null}
        <PrimaryButton label="Save" onPress={() => void save()} />
        {goalId ? (
          <View style={styles.delete}>
            <TextAction label="Delete goal" onPress={confirmDelete} tone="muted" />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[4],
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  exercise: {
    minHeight: 44,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  missing: {
    paddingTop: spacing[4],
  },
  delete: {
    alignItems: 'flex-start',
  },
});
