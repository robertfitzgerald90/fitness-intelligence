import { sqliteExerciseRepository } from '@/data/sqlite/sqliteExerciseRepository';
import { sqliteWorkoutTemplateRepository } from '@/data/sqlite/sqliteWorkoutTemplateRepository';

export const trainContainer = {
  exercises: sqliteExerciseRepository,
  templates: sqliteWorkoutTemplateRepository,
};
