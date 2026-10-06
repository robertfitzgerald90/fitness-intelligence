import { createId } from '@/data/sqlite/createId';
import { getDatabase } from '@/data/sqlite/database';
import type { WorkoutTemplateRepository } from '@/data/repositories/workoutTemplateRepository';
import { isExerciseCategory } from '@/domain/models/exercise';
import type { TemplateExercise, WorkoutTemplate, WorkoutTemplateSummary } from '@/domain/models/workoutTemplate';

type SummaryRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  exercise_count: number;
};

type TemplateRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type TemplateExerciseRow = {
  id: string;
  exercise_id: string;
  sort_order: number;
  name: string;
  category: string;
};

export const sqliteWorkoutTemplateRepository: WorkoutTemplateRepository = {
  async list() {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SummaryRow>(
      `SELECT t.id, t.name, t.created_at, t.updated_at, COUNT(e.id) AS exercise_count
       FROM workout_templates t
       LEFT JOIN workout_template_exercises e ON e.workout_template_id = t.id
       GROUP BY t.id
       ORDER BY t.created_at ASC`,
    );
    return rows.map(toSummary);
  },

  async getById(id) {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TemplateRow>(
      'SELECT id, name, created_at, updated_at FROM workout_templates WHERE id = ?',
      id,
    );
    if (!row) {
      return null;
    }
    const exercises = await listTemplateExercises(id);
    return toTemplate(row, exercises);
  },

  async save(input) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = input.id ?? createId('template');

    await db.withTransactionAsync(async () => {
      const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM workout_templates WHERE id = ?', id);
      if (existing) {
        await db.runAsync('UPDATE workout_templates SET name = ?, updated_at = ? WHERE id = ?', input.name, now, id);
      } else {
        await db.runAsync(
          'INSERT INTO workout_templates (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
          id,
          input.name,
          now,
          now,
        );
      }
      await db.runAsync('DELETE FROM workout_template_exercises WHERE workout_template_id = ?', id);
      for (let order = 0; order < input.exerciseIds.length; order += 1) {
        const exerciseId = input.exerciseIds[order];
        if (!exerciseId) {
          continue;
        }
        await db.runAsync(
          `INSERT INTO workout_template_exercises (id, workout_template_id, exercise_id, sort_order)
           VALUES (?, ?, ?, ?)`,
          createId('tte'),
          id,
          exerciseId,
          order,
        );
      }
    });

    const saved = await sqliteWorkoutTemplateRepository.getById(id);
    if (!saved) {
      throw new Error('Saved workout could not be read back.');
    }
    return saved;
  },

  async delete(id) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM workout_templates WHERE id = ?', id);
  },
};

async function listTemplateExercises(templateId: string): Promise<TemplateExercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TemplateExerciseRow>(
    `SELECT link.id, link.exercise_id, link.sort_order, exercise.name, exercise.category
     FROM workout_template_exercises link
     INNER JOIN exercises exercise ON exercise.id = link.exercise_id
     WHERE link.workout_template_id = ?
     ORDER BY link.sort_order ASC`,
    templateId,
  );
  return rows.map((row) => {
    if (!isExerciseCategory(row.category)) {
      throw new Error(`Unknown exercise category: ${row.category}`);
    }
    return {
      id: row.id,
      exerciseId: row.exercise_id,
      order: row.sort_order,
      name: row.name,
      category: row.category,
    };
  });
}

function toSummary(row: SummaryRow): WorkoutTemplateSummary {
  return {
    id: row.id,
    name: row.name,
    exerciseCount: Number(row.exercise_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTemplate(row: TemplateRow, exercises: TemplateExercise[]): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exercises,
  };
}
