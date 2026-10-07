import type { Exercise, ExerciseCategory, ExerciseLoggingType } from '@/domain/models/exercise';

export interface ExerciseRepository {
  list(): Promise<Exercise[]>;
  setFavorite(id: string, isFavorite: boolean): Promise<void>;
  createCustom(input: { name: string; category: ExerciseCategory; loggingType: ExerciseLoggingType }): Promise<Exercise>;
}
