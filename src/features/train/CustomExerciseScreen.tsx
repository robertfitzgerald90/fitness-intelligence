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
import { exerciseCategories, type ExerciseCategory } from '@/domain/models/exercise';

export function CustomExerciseScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save(): Promise<void> {
    const result = await createCustomExercise({ name, category });
    if (!result.ok) {
      setMessage(result.reason === 'name' ? 'Give this exercise a name.' : 'Choose a category.');
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
