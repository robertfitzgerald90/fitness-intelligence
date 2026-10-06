import type { Exercise, ExerciseCategory } from '@/domain/models/exercise';

export interface ExerciseRepository {
  list(): Promise<Exercise[]>;
  setFavorite(id: string, isFavorite: boolean): Promise<void>;
  createCustom(input: { name: string; category: ExerciseCategory }): Promise<Exercise>;
}
