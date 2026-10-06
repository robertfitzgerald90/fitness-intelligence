export const exerciseCategories = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
] as const;

export type ExerciseCategory = (typeof exerciseCategories)[number];

export function isExerciseCategory(value: string): value is ExerciseCategory {
  return (exerciseCategories as readonly string[]).includes(value);
}

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  isCustom: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};
