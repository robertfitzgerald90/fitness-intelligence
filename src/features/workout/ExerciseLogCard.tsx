import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  durationToInput,
  formatLoggedSet,
  incompleteSetMessage,
  isUsableLoggedSet,
  parseDurationInput,
  parseRepsInput,
  parseWeightInput,
  primarySetField,
  sanitizeDurationInput,
  sanitizeRepsInput,
  sanitizeWeightInput,
  weightToInput,
} from '@/application/workout/format';
import { saveExerciseNote, saveWorkoutSet } from '@/application/workout/useCases';
import { AppText } from '@/components/AppText';
import { TextAction } from '@/components/TextAction';
import { colors, radius, spacing } from '@/design/tokens';
import type { ExerciseLoggingType } from '@/domain/models/exercise';
import type { StrengthSessionExercise, StrengthSet } from '@/domain/models/strengthSession';

type FieldName = 'weight' | 'reps' | 'duration';

type Props = {
  exercise: StrengthSessionExercise;
  previousLabel?: string;
  editable: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  focusSetId?: string | null;
  onFocusHandled?: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onMove?: (direction: -1 | 1) => void;
  onRemoveExercise?: () => void;
};

export function ExerciseLogCard({
  exercise,
  previousLabel,
  editable,
  canMoveUp,
  canMoveDown,
  focusSetId = null,
  onFocusHandled,
  onAddSet,
  onRemoveSet,
  onMove,
  onRemoveExercise,
}: Props) {
  const inputs = useRef<Record<string, Partial<Record<FieldName, TextInput | null>>>>({});
  const loggedLines = exercise.sets.flatMap((set) => {
    const line = formatLoggedSet(exercise.loggingType, set);
    return line ? [{ id: set.id, line }] : [];
  });

  useEffect(() => {
    if (!focusSetId) {
      return;
    }
    const set = exercise.sets.find((item) => item.id === focusSetId);
    if (!set) {
      return;
    }
    const field = primarySetField(exercise.loggingType, set.weight);
    const timer = setTimeout(() => {
      inputs.current[set.id]?.[field]?.focus();
      onFocusHandled?.();
    }, 50);
    return () => clearTimeout(timer);
  }, [exercise.loggingType, exercise.sets, focusSetId, onFocusHandled]);

  function focusSet(set: StrengthSet | undefined): void {
    if (!set) {
      return;
    }
    const field = primarySetField(exercise.loggingType, set.weight);
    inputs.current[set.id]?.[field]?.focus();
  }

  return (
    <View style={styles.block}>
      <AppText role="title3">{exercise.exerciseNameSnapshot}</AppText>
      {previousLabel ? (
        <AppText role="small" color="textMuted">
          {previousLabel}
        </AppText>
      ) : null}
      {editable && (onMove || onRemoveExercise) ? (
        <View style={styles.actions}>
          {canMoveUp ? (
            <TextAction
              label="Up"
              tone="muted"
              accessibilityLabel={`Move ${exercise.exerciseNameSnapshot} up`}
              onPress={() => onMove?.(-1)}
            />
          ) : null}
          {canMoveDown ? (
            <TextAction
              label="Down"
              tone="muted"
              accessibilityLabel={`Move ${exercise.exerciseNameSnapshot} down`}
              onPress={() => onMove?.(1)}
            />
          ) : null}
          {onRemoveExercise ? (
            <TextAction
              label="Remove"
              tone="muted"
              accessibilityLabel={`Remove ${exercise.exerciseNameSnapshot}`}
              onPress={onRemoveExercise}
            />
          ) : null}
        </View>
      ) : null}
      {editable ? (
        <>
          {exercise.sets.length > 0 ? <SetColumns loggingType={exercise.loggingType} /> : null}
          {exercise.sets.length === 0 ? (
            <AppText role="small" color="textMuted">
              No sets yet
            </AppText>
          ) : null}
          {exercise.sets.map((set, index) => (
            <SetEntry
              key={set.id}
              set={set}
              index={index}
              loggingType={exercise.loggingType}
              bindInput={(field, node) => {
                const current = inputs.current[set.id] ?? {};
                current[field] = node;
                inputs.current[set.id] = current;
              }}
              onAdvance={() => focusSet(exercise.sets[index + 1])}
              onRemove={() => onRemoveSet(set.id)}
            />
          ))}
          <TextAction label="Add set" accessibilityLabel={`Add set to ${exercise.exerciseNameSnapshot}`} onPress={onAddSet} />
          <NoteField exerciseId={exercise.id} note={exercise.note} />
        </>
      ) : (
        <>
          {loggedLines.map((set) => (
            <AppText key={set.id} role="body">
              {set.line}
            </AppText>
          ))}
          {exercise.note ? (
            <AppText role="small" color="textSecondary">
              {exercise.note}
            </AppText>
          ) : null}
        </>
      )}
    </View>
  );
}

function SetColumns({ loggingType }: { loggingType: ExerciseLoggingType }) {
  const labels =
    loggingType === 'reps' ? ['Reps'] : loggingType === 'duration_weight' ? ['Duration', 'Weight'] : ['Weight', 'Reps'];
  return (
    <View style={styles.row}>
      <View style={styles.indexCol}>
        <AppText role="caption" color="textMuted">
          Set
        </AppText>
      </View>
      {labels.map((label) => (
        <View key={label} style={styles.valueCol}>
          <AppText role="caption" color="textMuted">
            {label}
          </AppText>
        </View>
      ))}
      <View style={styles.checkCol} />
    </View>
  );
}

function SetEntry({
  set,
  index,
  loggingType,
  onRemove,
  onAdvance,
  bindInput,
}: {
  set: StrengthSet;
  index: number;
  loggingType: ExerciseLoggingType;
  onRemove: () => void;
  onAdvance: () => void;
  bindInput: (field: FieldName, node: TextInput | null) => void;
}) {
  const [weightText, setWeightText] = useState(weightToInput(set.weight));
  const [repsText, setRepsText] = useState(set.reps == null ? '' : String(set.reps));
  const [durationText, setDurationText] = useState(durationToInput(set.durationSeconds));
  const [completed, setCompleted] = useState(set.isCompleted);
  const [message, setMessage] = useState<string | null>(null);
  const weightRef = useRef<TextInput | null>(null);
  const repsRef = useRef<TextInput | null>(null);

  function values() {
    return {
      weight: loggingType === 'reps' ? set.weight : parseWeightInput(weightText),
      reps: loggingType === 'duration_weight' ? set.reps : parseRepsInput(repsText),
      durationSeconds: loggingType === 'duration_weight' ? parseDurationInput(durationText) : set.durationSeconds,
    };
  }

  function persist(nextCompleted: boolean, stillCompleted: boolean): void {
    const next = values();
    void saveWorkoutSet({
      setId: set.id,
      loggingType,
      weight: next.weight,
      reps: next.reps,
      durationSeconds: next.durationSeconds,
      isCompleted: nextCompleted ? stillCompleted : false,
    });
  }

  function changeWeight(text: string): void {
    const next = sanitizeWeightInput(text);
    setWeightText(next);
    const parsed = values();
    parsed.weight = parseWeightInput(next);
    const stillCompleted = completed && isUsableLoggedSet(loggingType, parsed.weight, parsed.reps, parsed.durationSeconds);
    if (completed && !stillCompleted) {
      setCompleted(false);
    }
    setMessage(null);
    void saveWorkoutSet({
      setId: set.id,
      loggingType,
      weight: parsed.weight,
      reps: parsed.reps,
      durationSeconds: parsed.durationSeconds,
      isCompleted: stillCompleted,
    });
  }

  function changeReps(text: string): void {
    const next = sanitizeRepsInput(text);
    setRepsText(next);
    const parsed = values();
    parsed.reps = parseRepsInput(next);
    const stillCompleted = completed && isUsableLoggedSet(loggingType, parsed.weight, parsed.reps, parsed.durationSeconds);
    if (completed && !stillCompleted) {
      setCompleted(false);
    }
    setMessage(null);
    void saveWorkoutSet({
      setId: set.id,
      loggingType,
      weight: parsed.weight,
      reps: parsed.reps,
      durationSeconds: parsed.durationSeconds,
      isCompleted: stillCompleted,
    });
  }

  function changeDuration(text: string): void {
    const next = sanitizeDurationInput(text);
    setDurationText(next);
    const parsed = values();
    parsed.durationSeconds = parseDurationInput(next);
    const stillCompleted = completed && isUsableLoggedSet(loggingType, parsed.weight, parsed.reps, parsed.durationSeconds);
    if (completed && !stillCompleted) {
      setCompleted(false);
    }
    setMessage(null);
    void saveWorkoutSet({
      setId: set.id,
      loggingType,
      weight: parsed.weight,
      reps: parsed.reps,
      durationSeconds: parsed.durationSeconds,
      isCompleted: stillCompleted,
    });
  }

  function toggleComplete(): void {
    const parsed = values();
    if (completed) {
      setCompleted(false);
      setMessage(null);
      persist(false, false);
      return;
    }
    if (!isUsableLoggedSet(loggingType, parsed.weight, parsed.reps, parsed.durationSeconds)) {
      setMessage(incompleteSetMessage(loggingType));
      return;
    }
    setCompleted(true);
    setMessage(null);
    persist(true, true);
  }

  function confirmRemove(): void {
    Alert.alert(`Remove set ${index + 1}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  }

  return (
    <View style={styles.setBlock}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove set ${index + 1}`}
          onPress={confirmRemove}
          style={styles.indexCol}
        >
          <AppText role="bodyStrong" color="textSecondary">
            {index + 1}
          </AppText>
        </Pressable>
        {loggingType === 'duration_weight' ? (
          <TextInput
            ref={(node) => bindInput('duration', node)}
            value={durationText}
            onChangeText={changeDuration}
            onEndEditing={() => {
              const duration = parseDurationInput(durationText);
              if (duration != null) {
                setDurationText(durationToInput(duration));
              }
            }}
            onSubmitEditing={() => weightRef.current?.focus()}
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="next"
            blurOnSubmit={false}
            selectTextOnFocus
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={`Duration for set ${index + 1}`}
            style={styles.input}
          />
        ) : null}
        {loggingType !== 'reps' ? (
          <TextInput
            ref={(node) => {
              weightRef.current = node;
              bindInput('weight', node);
            }}
            value={weightText}
            onChangeText={changeWeight}
            onEndEditing={() => {
              const weight = parseWeightInput(weightText);
              if (weight != null) {
                setWeightText(weightToInput(weight));
              }
            }}
            onSubmitEditing={() => {
              if (loggingType === 'weight_reps') {
                repsRef.current?.focus();
                return;
              }
              onAdvance();
            }}
            keyboardType="decimal-pad"
            inputMode="decimal"
            returnKeyType={loggingType === 'duration_weight' ? 'done' : 'next'}
            blurOnSubmit={loggingType === 'duration_weight'}
            selectTextOnFocus
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={
              loggingType === 'duration_weight' ? `Optional weight for set ${index + 1}` : `Weight for set ${index + 1}`
            }
            style={styles.input}
          />
        ) : null}
        {loggingType !== 'duration_weight' ? (
          <TextInput
            ref={(node) => {
              repsRef.current = node;
              bindInput('reps', node);
            }}
            value={repsText}
            onChangeText={changeReps}
            onSubmitEditing={onAdvance}
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            selectTextOnFocus
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={`Reps for set ${index + 1}`}
            style={styles.input}
          />
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={completed ? `Mark set ${index + 1} incomplete` : `Complete set ${index + 1}`}
          onPress={toggleComplete}
          style={styles.checkCol}
        >
          <Ionicons
            name={completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={completed ? colors.primary : colors.textMuted}
          />
        </Pressable>
      </View>
      {message ? (
        <AppText role="small" color="textSecondary">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

function NoteField({ exerciseId, note }: { exerciseId: string; note: string | null }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(note ?? '');
  const visibleNote = value.trim();

  if (!open) {
    return (
      <View style={styles.note}>
        {visibleNote.length > 0 ? (
          <AppText role="small" color="textSecondary">
            {visibleNote}
          </AppText>
        ) : null}
        <TextAction
          label={visibleNote.length > 0 ? 'Edit note' : 'Add note'}
          tone="muted"
          onPress={() => setOpen(true)}
        />
      </View>
    );
  }

  return (
    <TextInput
      value={value}
      onChangeText={(text) => {
        setValue(text);
        void saveExerciseNote(exerciseId, text);
      }}
      onEndEditing={() => {
        if (value.trim().length === 0) {
          setOpen(false);
        }
      }}
      placeholder="Note"
      placeholderTextColor={colors.textMuted}
      accessibilityLabel="Exercise note"
      autoCorrect
      style={styles.noteInput}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing[2],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  indexCol: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueCol: {
    flex: 1,
    alignItems: 'center',
  },
  checkCol: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    color: colors.textPrimary,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    paddingHorizontal: spacing[2],
  },
  setBlock: {
    gap: spacing[1],
  },
  note: {
    gap: spacing[1],
  },
  noteInput: {
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSubtle,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing[3],
  },
});
