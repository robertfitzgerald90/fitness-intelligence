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

export const exerciseLoggingTypes = ['weight_reps', 'reps', 'duration_weight'] as const;

export type ExerciseLoggingType = (typeof exerciseLoggingTypes)[number];

export function isExerciseLoggingType(value: string): value is ExerciseLoggingType {
  return (exerciseLoggingTypes as readonly string[]).includes(value);
}

export const loggingTypeChoices: { type: ExerciseLoggingType; label: string }[] = [
  { type: 'weight_reps', label: 'Weight & Reps' },
  { type: 'reps', label: 'Reps' },
  { type: 'duration_weight', label: 'Duration' },
];

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  loggingType: ExerciseLoggingType;
  isCustom: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};
