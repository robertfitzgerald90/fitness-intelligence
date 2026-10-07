import { createId } from '@/data/sqlite/createId';
import { getDatabase } from '@/data/sqlite/database';
import type { ExerciseRepository } from '@/data/repositories/exerciseRepository';
import { isExerciseCategory, isExerciseLoggingType, type Exercise } from '@/domain/models/exercise';

type ExerciseRow = {
  id: string;
  name: string;
  category: string;
  logging_type: string;
  is_custom: number;
  is_favorite: number;
  created_at: string;
  updated_at: string;
};

export const sqliteExerciseRepository: ExerciseRepository = {
  async list() {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExerciseRow>(
      'SELECT id, name, category, logging_type, is_custom, is_favorite, created_at, updated_at FROM exercises ORDER BY name COLLATE NOCASE ASC',
    );
    return rows.map(toExercise);
  },

  async setFavorite(id, isFavorite) {
    const db = await getDatabase();
    await db.runAsync('UPDATE exercises SET is_favorite = ?, updated_at = ? WHERE id = ?', isFavorite ? 1 : 0, new Date().toISOString(), id);
  },

  async createCustom(input) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const exercise: Exercise = {
      id: createId('ex'),
      name: input.name,
      category: input.category,
      loggingType: input.loggingType,
      isCustom: true,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      `INSERT INTO exercises (id, name, category, logging_type, is_custom, is_favorite, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, 0, ?, ?)`,
      exercise.id,
      exercise.name,
      exercise.category,
      exercise.loggingType,
      exercise.createdAt,
      exercise.updatedAt,
    );
    return exercise;
  },
};

function toExercise(row: ExerciseRow): Exercise {
  if (!isExerciseCategory(row.category)) {
    throw new Error(`Unknown exercise category: ${row.category}`);
  }
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    loggingType: isExerciseLoggingType(row.logging_type) ? row.logging_type : 'weight_reps',
    isCustom: row.is_custom === 1,
    isFavorite: row.is_favorite === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
