import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  isUsableLoggedSet,
  parseRepsInput,
  parseWeightInput,
  sanitizeRepsInput,
  sanitizeWeightInput,
  weightToInput,
} from '@/application/workout/format';
import { saveExerciseNote, saveWorkoutSet } from '@/application/workout/useCases';
import { AppText } from '@/components/AppText';
import { TextAction } from '@/components/TextAction';
import { colors, radius, spacing } from '@/design/tokens';
import type { StrengthSessionExercise, StrengthSet } from '@/domain/models/strengthSession';

type Props = {
  exercise: StrengthSessionExercise;
  previousLabel?: string;
  editable: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
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
  onAddSet,
  onRemoveSet,
  onMove,
  onRemoveExercise,
}: Props) {
  const completedSets = exercise.sets.filter((set) => set.isCompleted && set.weight != null && set.reps != null);
  const weightInputs = useRef<Record<string, TextInput | null>>({});

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
          {exercise.sets.length > 0 ? <SetColumns /> : null}
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
              weightRef={(node) => {
                weightInputs.current[set.id] = node;
              }}
              onRepsSubmit={() => {
                const next = exercise.sets[index + 1];
                if (next) {
                  weightInputs.current[next.id]?.focus();
                }
              }}
              onRemove={() => onRemoveSet(set.id)}
            />
          ))}
          <TextAction label="Add set" accessibilityLabel={`Add set to ${exercise.exerciseNameSnapshot}`} onPress={onAddSet} />
          <NoteField exerciseId={exercise.id} note={exercise.note} />
        </>
      ) : (
        <>
          {completedSets.map((set) => (
            <AppText key={set.id} role="body">
              {`${formatCompleted(set)}`}
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

function formatCompleted(set: StrengthSet): string {
  return `${weightToInput(set.weight)} lb × ${set.reps ?? ''}`;
}

function SetColumns() {
  return (
    <View style={styles.row}>
      <View style={styles.indexCol}>
        <AppText role="caption" color="textMuted">
          Set
        </AppText>
      </View>
      <View style={styles.valueCol}>
        <AppText role="caption" color="textMuted">
          Weight
        </AppText>
      </View>
      <View style={styles.valueCol}>
        <AppText role="caption" color="textMuted">
          Reps
        </AppText>
      </View>
      <View style={styles.checkCol} />
    </View>
  );
}

function SetEntry({
  set,
  index,
  onRemove,
  onRepsSubmit,
  weightRef,
}: {
  set: StrengthSet;
  index: number;
  onRemove: () => void;
  onRepsSubmit: () => void;
  weightRef: (node: TextInput | null) => void;
}) {
  const [weightText, setWeightText] = useState(weightToInput(set.weight));
  const [repsText, setRepsText] = useState(set.reps == null ? '' : String(set.reps));
  const [completed, setCompleted] = useState(set.isCompleted);
  const [message, setMessage] = useState<string | null>(null);
  const repsRef = useRef<TextInput | null>(null);

  function confirmRemove(): void {
    Alert.alert(`Remove set ${index + 1}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  }

  function changeWeight(text: string): void {
    const next = sanitizeWeightInput(text);
    setWeightText(next);
    const weight = parseWeightInput(next);
    const reps = parseRepsInput(repsText);
    const stillCompleted = completed && isUsableLoggedSet(weight, reps);
    if (completed && !stillCompleted) {
      setCompleted(false);
    }
    setMessage(null);
    void saveWorkoutSet({ setId: set.id, weight, reps, isCompleted: stillCompleted });
  }

  function changeReps(text: string): void {
    const next = sanitizeRepsInput(text);
    setRepsText(next);
    const weight = parseWeightInput(weightText);
    const reps = parseRepsInput(next);
    const stillCompleted = completed && isUsableLoggedSet(weight, reps);
    if (completed && !stillCompleted) {
      setCompleted(false);
    }
    setMessage(null);
    void saveWorkoutSet({ setId: set.id, weight, reps, isCompleted: stillCompleted });
  }

  function toggleComplete(): void {
    if (completed) {
      setCompleted(false);
      setMessage(null);
      void saveWorkoutSet({
        setId: set.id,
        weight: parseWeightInput(weightText),
        reps: parseRepsInput(repsText),
        isCompleted: false,
      });
      return;
    }
    const weight = parseWeightInput(weightText);
    const reps = parseRepsInput(repsText);
    if (!isUsableLoggedSet(weight, reps)) {
      setMessage('Enter a weight and reps.');
      return;
    }
    setCompleted(true);
    setMessage(null);
    void saveWorkoutSet({ setId: set.id, weight, reps, isCompleted: true });
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
        <TextInput
          ref={weightRef}
          value={weightText}
          onChangeText={changeWeight}
          onEndEditing={() => {
            const weight = parseWeightInput(weightText);
            if (weight != null) {
              setWeightText(weightToInput(weight));
            }
          }}
          onSubmitEditing={() => repsRef.current?.focus()}
          keyboardType="decimal-pad"
          inputMode="decimal"
          returnKeyType="next"
          blurOnSubmit={false}
          selectTextOnFocus
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={`Weight for set ${index + 1}`}
          style={styles.input}
        />
        <TextInput
          ref={(node) => {
            repsRef.current = node;
          }}
          value={repsText}
          onChangeText={changeReps}
          onSubmitEditing={onRepsSubmit}
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="done"
          selectTextOnFocus
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={`Reps for set ${index + 1}`}
          style={styles.input}
        />
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
