import { sqliteExerciseRepository } from '@/data/sqlite/sqliteExerciseRepository';
import { sqliteWorkoutSessionRepository } from '@/data/sqlite/sqliteWorkoutSessionRepository';
import { sqliteWorkoutTemplateRepository } from '@/data/sqlite/sqliteWorkoutTemplateRepository';

export const trainContainer = {
  exercises: sqliteExerciseRepository,
  templates: sqliteWorkoutTemplateRepository,
  sessions: sqliteWorkoutSessionRepository,
};
