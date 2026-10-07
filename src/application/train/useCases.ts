import { trainContainer } from '@/application/train/container';
import { exerciseCategories, isExerciseCategory, isExerciseLoggingType, type Exercise } from '@/domain/models/exercise';
import type { WorkoutTemplate, WorkoutTemplateSummary } from '@/domain/models/workoutTemplate';

export async function listWorkoutTemplates(): Promise<WorkoutTemplateSummary[]> {
  return trainContainer.templates.list();
}

export async function getWorkoutTemplate(id: string): Promise<WorkoutTemplate | null> {
  return trainContainer.templates.getById(id);
}

export async function saveWorkoutTemplate(input: {
  id: string | null;
  name: string;
  exerciseIds: string[];
}): Promise<{ ok: true } | { ok: false; reason: 'name' }> {
  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name' };
  }
  await trainContainer.templates.save({
    id: input.id ?? undefined,
    name,
    exerciseIds: input.exerciseIds,
  });
  return { ok: true };
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  await trainContainer.templates.delete(id);
}

export async function listExercises(): Promise<Exercise[]> {
  const exercises = await trainContainer.exercises.list();
  return exercises.slice().sort((left, right) => {
    const categoryOrder = exerciseCategories.indexOf(left.category) - exerciseCategories.indexOf(right.category);
    if (categoryOrder !== 0) {
      return categoryOrder;
    }
    return left.name.localeCompare(right.name);
  });
}

export async function setExerciseFavorite(id: string, isFavorite: boolean): Promise<void> {
  await trainContainer.exercises.setFavorite(id, isFavorite);
}

export async function createCustomExercise(input: {
  name: string;
  category: string | null;
  loggingType: string | null;
}): Promise<{ ok: true; exercise: Exercise } | { ok: false; reason: 'name' | 'category' | 'tracking' }> {
  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name' };
  }
  if (!input.category || !isExerciseCategory(input.category)) {
    return { ok: false, reason: 'category' };
  }
  if (!input.loggingType || !isExerciseLoggingType(input.loggingType)) {
    return { ok: false, reason: 'tracking' };
  }
  const exercise = await trainContainer.exercises.createCustom({
    name,
    category: input.category,
    loggingType: input.loggingType,
  });
  return { ok: true, exercise };
}
