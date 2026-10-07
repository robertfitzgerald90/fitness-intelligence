import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { createCustomExercise } from '@/application/train/useCases';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import {
  exerciseCategories,
  loggingTypeChoices,
  type ExerciseCategory,
  type ExerciseLoggingType,
} from '@/domain/models/exercise';

export function CustomExerciseScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [loggingType, setLoggingType] = useState<ExerciseLoggingType | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save(): Promise<void> {
    const result = await createCustomExercise({ name, category, loggingType });
    if (!result.ok) {
      setMessage(
        result.reason === 'name'
          ? 'Give this exercise a name.'
          : result.reason === 'category'
            ? 'Choose a category.'
            : 'Choose how you track this exercise.',
      );
      return;
    }
    router.back();
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Exercise name" />
        <View style={styles.categories}>
          <AppText role="caption" color="textMuted">
            Category
          </AppText>
          <View style={styles.chips}>
            {exerciseCategories.map((item) => (
              <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
            ))}
          </View>
        </View>
        <View style={styles.categories}>
          <AppText role="caption" color="textMuted">
            How do you track this exercise?
          </AppText>
          <View style={styles.chips}>
            {loggingTypeChoices.map((choice) => (
              <Chip
                key={choice.type}
                label={choice.label}
                selected={loggingType === choice.type}
                onPress={() => setLoggingType(choice.type)}
              />
            ))}
          </View>
          {loggingType === 'duration_weight' ? (
            <AppText role="small" color="textSecondary">
              Weight is optional.
            </AppText>
          ) : null}
        </View>
        {message ? (
          <AppText role="small" color="textSecondary">
            {message}
          </AppText>
        ) : null}
        <PrimaryButton label="Save exercise" onPress={() => void save()} />
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
  categories: {
    gap: spacing[2],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
});
