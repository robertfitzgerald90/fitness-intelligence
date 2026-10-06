import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  addExerciseToSessionDraft,
  addExerciseToTemplateDraft,
  getSessionDraft,
  getTemplateDraft,
} from '@/application/train/drafts';
import { listExercises, setExerciseFavorite } from '@/application/train/useCases';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { TextAction } from '@/components/TextAction';
import { TextField } from '@/components/TextField';
import { colors, spacing } from '@/design/tokens';
import { exerciseCategories, type Exercise, type ExerciseCategory } from '@/domain/models/exercise';

type Filter = 'all' | 'favorites' | ExerciseCategory;
type Purpose = 'template' | 'session';

type Props = {
  purpose: Purpose;
};

export function ExerciseLibraryScreen({ purpose }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const draft = purpose === 'session' ? getSessionDraft() : getTemplateDraft();
      setSelectedIds(draft?.exercises.map((exercise) => exercise.exerciseId) ?? []);
      listExercises()
        .then((next) => {
          if (!cancelled) {
            setExercises(next);
            setLoaded(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setExercises([]);
            setLoaded(true);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [purpose]),
  );

  const normalizedQuery = query.trim().toLowerCase();
  const visible = exercises.filter((exercise) => {
    const matchesQuery = exercise.name.toLowerCase().includes(normalizedQuery);
    const matchesFilter =
      filter === 'all' || (filter === 'favorites' ? exercise.isFavorite : exercise.category === filter);
    return matchesQuery && matchesFilter;
  });
  const hasFavorites = exercises.some((exercise) => exercise.isFavorite);
  const showFavoriteEmpty = filter === 'favorites' && normalizedQuery.length === 0 && !hasFavorites;

  function selectExercise(exercise: Exercise): void {
    if (selectedIds.includes(exercise.id)) {
      return;
    }
    const draftExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
    };
    const result =
      purpose === 'session' ? addExerciseToSessionDraft(draftExercise) : addExerciseToTemplateDraft(draftExercise);
    if (result === 'added') {
      router.back();
    }
  }

  async function toggleFavorite(exercise: Exercise): Promise<void> {
    const nextFavorite = !exercise.isFavorite;
    setExercises((current) =>
      current.map((item) => (item.id === exercise.id ? { ...item, isFavorite: nextFavorite } : item)),
    );
    try {
      await setExerciseFavorite(exercise.id, nextFavorite);
    } catch {
      setExercises((current) =>
        current.map((item) => (item.id === exercise.id ? { ...item, isFavorite: exercise.isFavorite } : item)),
      );
    }
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TextField label="Search" value={query} onChangeText={setQuery} placeholder="Search exercises" />
        <View style={styles.filters}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Favorites" selected={filter === 'favorites'} onPress={() => setFilter('favorites')} />
          {exerciseCategories.map((category) => (
            <Chip
              key={category}
              label={category}
              selected={filter === category}
              onPress={() => setFilter(category)}
            />
          ))}
        </View>
        {loaded && showFavoriteEmpty ? (
          <EmptyState title="No favorites yet" message="Exercises you favorite will show up here." />
        ) : null}
        {loaded && !showFavoriteEmpty && visible.length === 0 ? (
          <EmptyState title="No exercises found." message="Try another name or category." />
        ) : null}
        <View style={styles.list}>
          {visible.map((exercise) => {
            const added = selectedIds.includes(exercise.id);
            return (
              <View key={exercise.id} style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={added ? `${exercise.name} already added` : `Add ${exercise.name}`}
                  onPress={() => selectExercise(exercise)}
                  style={styles.rowMain}
                >
                  <AppText role="bodyStrong">{exercise.name}</AppText>
                  <AppText role="small" color="textMuted">
                    {added ? 'Added' : exercise.category}
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    exercise.isFavorite ? `Unfavorite ${exercise.name}` : `Favorite ${exercise.name}`
                  }
                  onPress={() => void toggleFavorite(exercise)}
                  hitSlop={8}
                  style={styles.star}
                >
                  <Ionicons
                    name={exercise.isFavorite ? 'star' : 'star-outline'}
                    size={20}
                    color={exercise.isFavorite ? colors.primary : colors.textMuted}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
        <TextAction label="Create exercise" onPress={() => router.push('/exercises/new')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  list: {
    gap: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  rowMain: {
    flex: 1,
    gap: spacing[1],
    minHeight: 44,
    justifyContent: 'center',
  },
  star: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
