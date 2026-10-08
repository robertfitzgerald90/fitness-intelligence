import { createId } from '@/data/sqlite/createId';
import { getDatabase } from '@/data/sqlite/database';
import type { GoalRepository, SaveGoalInput } from '@/data/repositories/goalRepository';
import { isWeightUnit } from '@/domain/models/body';
import { isExerciseLoggingType } from '@/domain/models/exercise';
import type { PersonalGoal } from '@/domain/models/personalGoal';

type GoalRow = {
  id: string;
  type: string;
  target_weight: number | null;
  weight_unit: string | null;
  exercise_id: string | null;
  exercise_name_snapshot: string | null;
  logging_type: string | null;
  target_reps: number | null;
  target_duration_seconds: number | null;
  workouts_per_week: number | null;
  created_at: string;
  updated_at: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function toGoal(row: GoalRow): PersonalGoal | null {
  if (row.type === 'body_weight') {
    if (row.target_weight == null || row.weight_unit == null || !isWeightUnit(row.weight_unit)) {
      return null;
    }
    return {
      id: row.id,
      type: 'body_weight',
      targetWeight: row.target_weight,
      weightUnit: row.weight_unit,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  if (row.type === 'strength') {
    if (
      row.exercise_name_snapshot == null ||
      row.logging_type == null ||
      !isExerciseLoggingType(row.logging_type)
    ) {
      return null;
    }
    return {
      id: row.id,
      type: 'strength',
      exerciseId: row.exercise_id,
      exerciseName: row.exercise_name_snapshot,
      loggingType: row.logging_type,
      targetWeight: row.target_weight,
      targetReps: row.target_reps,
      targetDurationSeconds: row.target_duration_seconds,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  if (row.type === 'training_frequency') {
    if (row.workouts_per_week == null) {
      return null;
    }
    return {
      id: row.id,
      type: 'training_frequency',
      workoutsPerWeek: row.workouts_per_week,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  if (row.type === 'running') {
    return {
      id: row.id,
      type: 'running',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  return null;
}

const SELECT = `SELECT id, type, target_weight, weight_unit, exercise_id, exercise_name_snapshot,
  logging_type, target_reps, target_duration_seconds, workouts_per_week, created_at, updated_at
  FROM goals`;

export const sqliteGoalRepository: GoalRepository = {
  async list() {
    const db = await getDatabase();
    const rows = await db.getAllAsync<GoalRow>(`${SELECT} ORDER BY created_at ASC, id ASC`);
    return rows.flatMap((row) => {
      const goal = toGoal(row);
      return goal ? [goal] : [];
    });
  },

  async getById(id) {
    const db = await getDatabase();
    const row = await db.getFirstAsync<GoalRow>(`${SELECT} WHERE id = ?`, id);
    return row ? toGoal(row) : null;
  },

  async save(input: SaveGoalInput) {
    const db = await getDatabase();
    const updatedAt = nowIso();
    const values = [
      input.type,
      input.targetWeight,
      input.weightUnit,
      input.exerciseId,
      input.exerciseName,
      input.loggingType,
      input.targetReps,
      input.targetDurationSeconds,
      input.workoutsPerWeek,
    ] as const;
    if (input.id) {
      await db.runAsync(
        `UPDATE goals
         SET type = ?, target_weight = ?, weight_unit = ?, exercise_id = ?, exercise_name_snapshot = ?,
             logging_type = ?, target_reps = ?, target_duration_seconds = ?, workouts_per_week = ?, updated_at = ?
         WHERE id = ?`,
        ...values,
        updatedAt,
        input.id,
      );
      const saved = await this.getById(input.id);
      if (!saved) {
        throw new Error('Goal was not saved.');
      }
      return saved;
    }
    const id = createId('goal');
    await db.runAsync(
      `INSERT INTO goals (
         id, type, target_weight, weight_unit, exercise_id, exercise_name_snapshot, logging_type,
         target_reps, target_duration_seconds, workouts_per_week, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      ...values,
      updatedAt,
      updatedAt,
    );
    const saved = await this.getById(id);
    if (!saved) {
      throw new Error('Goal was not saved.');
    }
    return saved;
  },

  async delete(id) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM goals WHERE id = ?', id);
  },
};
