import type { ExerciseCategory } from '@/domain/models/exercise';

export type TemplateExercise = {
  id: string;
  exerciseId: string;
  order: number;
  name: string;
  category: ExerciseCategory;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  exercises: TemplateExercise[];
};

export type WorkoutTemplateSummary = {
  id: string;
  name: string;
  exerciseCount: number;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutTemplateInput = {
  id?: string;
  name: string;
  exerciseIds: string[];
};
