import { StyleSheet, View } from 'react-native';

import type { DraftExercise } from '@/application/train/drafts';
import { AppText } from '@/components/AppText';
import { TextAction } from '@/components/TextAction';
import { spacing } from '@/design/tokens';

type Props = {
  exercises: DraftExercise[];
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
};

export function ExerciseOrderList({ exercises, onMove, onRemove }: Props) {
  if (exercises.length === 0) {
    return (
      <AppText role="body" color="textSecondary">
        Add the exercises you want in this workout.
      </AppText>
    );
  }

  return (
    <View style={styles.list}>
      {exercises.map((exercise, index) => (
        <View key={exercise.exerciseId} style={styles.item}>
          <AppText role="bodyStrong">{exercise.name}</AppText>
          <AppText role="small" color="textMuted">
            {exercise.category}
          </AppText>
          <View style={styles.actions}>
            <TextAction
              label="Up"
              tone="muted"
              onPress={() => onMove(index, -1)}
              accessibilityLabel={`Move ${exercise.name} up`}
            />
            <TextAction
              label="Down"
              tone="muted"
              onPress={() => onMove(index, 1)}
              accessibilityLabel={`Move ${exercise.name} down`}
            />
            <TextAction
              label="Remove"
              tone="muted"
              onPress={() => onRemove(index)}
              accessibilityLabel={`Remove ${exercise.name}`}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[4],
  },
  item: {
    gap: spacing[1],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
