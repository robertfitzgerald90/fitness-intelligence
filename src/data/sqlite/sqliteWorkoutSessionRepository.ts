import type * as SQLite from 'expo-sqlite';

import { createId } from '@/data/sqlite/createId';
import { getDatabase } from '@/data/sqlite/database';
import type {
  CompletedSetRecord,
  WorkoutSessionRepository,
} from '@/data/repositories/workoutSessionRepository';
import { rememberedWorkingWeight } from '@/domain/analytics/workingWeight';
import { isExerciseLoggingType, type ExerciseLoggingType } from '@/domain/models/exercise';
import {
  isStrengthSessionStatus,
  type StrengthSession,
  type StrengthSessionExercise,
  type StrengthSet,
} from '@/domain/models/strengthSession';

const DEFAULT_SET_COUNT = 3;

type SessionRow = {
  id: string;
  source_template_id: string | null;
  name: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ExerciseRow = {
  id: string;
  exercise_id: string;
  exercise_name_snapshot: string;
  logging_type: string;
  sort_order: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type SetRow = {
  id: string;
  workout_session_exercise_id: string;
  sort_order: number;
  weight: number | null;
  reps: number | null;
  duration_seconds: number | null;
  is_completed: number;
  created_at: string;
  updated_at: string;
};

export const sqliteWorkoutSessionRepository: WorkoutSessionRepository = {
  async getActive() {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM workout_sessions WHERE status = 'active' LIMIT 1`,
    );
    if (!row) {
      return null;
    }
    return loadSession(db, row.id);
  },

  async getById(id) {
    const db = await getDatabase();
    return loadSession(db, id);
  },

  async createActive(input) {
    const db = await getDatabase();
    const now = nowIso();
    const sessionId = createId('session');
    try {
      await db.withTransactionAsync(async () => {
        const existing = await db.getFirstAsync<{ id: string }>(
          `SELECT id FROM workout_sessions WHERE status = 'active' LIMIT 1`,
        );
        if (existing) {
          throw new ActiveSessionExistsError();
        }
        await db.runAsync(
          `INSERT INTO workout_sessions
             (id, source_template_id, name, status, started_at, completed_at, created_at, updated_at)
           VALUES (?, ?, ?, 'active', ?, NULL, ?, ?)`,
          sessionId,
          input.sourceTemplateId,
          input.name,
          now,
          now,
          now,
        );
        for (let order = 0; order < input.exercises.length; order += 1) {
          const exercise = input.exercises[order];
          if (!exercise) {
            continue;
          }
          const sessionExerciseId = createId('sse');
          await db.runAsync(
            `INSERT INTO workout_session_exercises
               (id, workout_session_id, exercise_id, exercise_name_snapshot, sort_order, note, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NULL, ?, ?)`,
            sessionExerciseId,
            sessionId,
            exercise.exerciseId,
            exercise.name,
            order,
            now,
            now,
          );
          await insertDefaultSets(db, sessionExerciseId, exercise.exerciseId, now);
        }
      });
    } catch (error) {
      if (error instanceof ActiveSessionExistsError || isUniqueConstraint(error)) {
        return { ok: false, reason: 'active' };
      }
      throw error;
    }
    const session = await loadSession(db, sessionId);
    if (!session) {
      throw new Error('Active workout could not be read back.');
    }
    return { ok: true, session };
  },

  async discardActive(id) {
    const db = await getDatabase();
    const result = await db.runAsync(`DELETE FROM workout_sessions WHERE id = ? AND status = 'active'`, id);
    return result.changes > 0;
  },

  async finish(id) {
    const db = await getDatabase();
    let outcome: { ok: true } | { ok: false; reason: 'missing' | 'not-active' | 'no-sets' } = {
      ok: false,
      reason: 'missing',
    };
    await db.withTransactionAsync(async () => {
      const session = await db.getFirstAsync<{ status: string }>(
        'SELECT status FROM workout_sessions WHERE id = ?',
        id,
      );
      if (!session) {
        outcome = { ok: false, reason: 'missing' };
        return;
      }
      if (session.status !== 'active') {
        outcome = { ok: false, reason: 'not-active' };
        return;
      }
      const completed = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count
         FROM workout_sets s
         INNER JOIN workout_session_exercises e ON e.id = s.workout_session_exercise_id
         WHERE e.workout_session_id = ?
           AND s.is_completed = 1
           AND (
             (s.reps IS NOT NULL AND s.reps >= 1)
             OR (s.duration_seconds IS NOT NULL AND s.duration_seconds >= 1)
           )`,
        id,
      );
      if (!completed || Number(completed.count) < 1) {
        outcome = { ok: false, reason: 'no-sets' };
        return;
      }
      await db.runAsync(
        `DELETE FROM workout_sets
         WHERE is_completed = 0
           AND workout_session_exercise_id IN (
             SELECT id FROM workout_session_exercises WHERE workout_session_id = ?
           )`,
        id,
      );
      await db.runAsync(
        `DELETE FROM workout_session_exercises
         WHERE workout_session_id = ?
           AND id NOT IN (SELECT workout_session_exercise_id FROM workout_sets)`,
        id,
      );
      await renumberExercises(db, id);
      const exerciseIds = await db.getAllAsync<{ id: string }>(
        'SELECT id FROM workout_session_exercises WHERE workout_session_id = ? ORDER BY sort_order ASC',
        id,
      );
      for (const exercise of exerciseIds) {
        await renumberSets(db, exercise.id);
      }
      const now = nowIso();
      await db.runAsync(
        `UPDATE workout_sessions
         SET status = 'completed', completed_at = ?, updated_at = ?
         WHERE id = ?`,
        now,
        now,
        id,
      );
      outcome = { ok: true };
    });
    return outcome;
  },

  async updateSet(input) {
    const db = await getDatabase();
    const parent = await db.getFirstAsync<{ session_id: string }>(
      `SELECT e.workout_session_id AS session_id
       FROM workout_sets s
       INNER JOIN workout_session_exercises e ON e.id = s.workout_session_exercise_id
       WHERE s.id = ?`,
      input.setId,
    );
    if (!parent) {
      return false;
    }
    const now = nowIso();
    await db.runAsync(
      `UPDATE workout_sets
       SET weight = ?, reps = ?, duration_seconds = ?, is_completed = ?, updated_at = ?
       WHERE id = ?`,
      input.weight,
      input.reps,
      input.durationSeconds,
      input.isCompleted ? 1 : 0,
      now,
      input.setId,
    );
    await touchSession(db, parent.session_id, now);
    return true;
  },

  async addSet(sessionExerciseId) {
    const db = await getDatabase();
    const parent = await db.getFirstAsync<{ session_id: string; exercise_id: string }>(
      'SELECT workout_session_id AS session_id, exercise_id FROM workout_session_exercises WHERE id = ?',
      sessionExerciseId,
    );
    if (!parent) {
      return null;
    }
    const loggingType = await loggingTypeFor(db, parent.exercise_id);
    const previous = await db.getFirstAsync<{ weight: number | null; sort_order: number }>(
      `SELECT weight, sort_order
       FROM workout_sets
       WHERE workout_session_exercise_id = ?
       ORDER BY sort_order DESC
       LIMIT 1`,
      sessionExerciseId,
    );
    const now = nowIso();
    const set: StrengthSet = {
      id: createId('set'),
      sortOrder: previous ? previous.sort_order + 1 : 0,
      weight: loggingType === 'reps' ? null : (previous?.weight ?? null),
      reps: null,
      durationSeconds: null,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      `INSERT INTO workout_sets
         (id, workout_session_exercise_id, sort_order, weight, reps, duration_seconds, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, NULL, 0, ?, ?)`,
      set.id,
      sessionExerciseId,
      set.sortOrder,
      set.weight,
      now,
      now,
    );
    await touchSession(db, parent.session_id, now);
    return set;
  },

  async removeSet(setId) {
    const db = await getDatabase();
    const parent = await db.getFirstAsync<{ session_id: string; exercise_id: string }>(
      `SELECT e.workout_session_id AS session_id, e.id AS exercise_id
       FROM workout_sets s
       INNER JOIN workout_session_exercises e ON e.id = s.workout_session_exercise_id
       WHERE s.id = ?`,
      setId,
    );
    if (!parent) {
      return;
    }
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM workout_sets WHERE id = ?', setId);
      await renumberSets(db, parent.exercise_id);
      await touchSession(db, parent.session_id, nowIso());
    });
  },

  async updateNote(sessionExerciseId, note) {
    const db = await getDatabase();
    const parent = await db.getFirstAsync<{ session_id: string }>(
      'SELECT workout_session_id AS session_id FROM workout_session_exercises WHERE id = ?',
      sessionExerciseId,
    );
    if (!parent) {
      return;
    }
    const now = nowIso();
    await db.runAsync(
      'UPDATE workout_session_exercises SET note = ?, updated_at = ? WHERE id = ?',
      note,
      now,
      sessionExerciseId,
    );
    await touchSession(db, parent.session_id, now);
  },

  async rename(sessionId, name) {
    const db = await getDatabase();
    const result = await db.runAsync(
      'UPDATE workout_sessions SET name = ?, updated_at = ? WHERE id = ?',
      name,
      nowIso(),
      sessionId,
    );
    return result.changes > 0;
  },

  async addExercise(sessionId, exercise) {
    const db = await getDatabase();
    const session = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM workout_sessions WHERE id = ?',
      sessionId,
    );
    if (!session) {
      return 'missing';
    }
    const duplicate = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM workout_session_exercises
       WHERE workout_session_id = ? AND exercise_id = ?`,
      sessionId,
      exercise.exerciseId,
    );
    if (duplicate) {
      return 'duplicate';
    }
    const last = await db.getFirstAsync<{ sort_order: number }>(
      `SELECT sort_order FROM workout_session_exercises
       WHERE workout_session_id = ?
       ORDER BY sort_order DESC
       LIMIT 1`,
      sessionId,
    );
    const now = nowIso();
    const sessionExerciseId = createId('sse');
    await db.runAsync(
      `INSERT INTO workout_session_exercises
         (id, workout_session_id, exercise_id, exercise_name_snapshot, sort_order, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NULL, ?, ?)`,
      sessionExerciseId,
      sessionId,
      exercise.exerciseId,
      exercise.name,
      last ? last.sort_order + 1 : 0,
      now,
      now,
    );
    await insertDefaultSets(db, sessionExerciseId, exercise.exerciseId, now);
    await touchSession(db, sessionId, now);
    return 'added';
  },

  async removeExercise(sessionExerciseId) {
    const db = await getDatabase();
    const parent = await db.getFirstAsync<{ session_id: string }>(
      'SELECT workout_session_id AS session_id FROM workout_session_exercises WHERE id = ?',
      sessionExerciseId,
    );
    if (!parent) {
      return;
    }
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM workout_session_exercises WHERE id = ?', sessionExerciseId);
      await renumberExercises(db, parent.session_id);
      await touchSession(db, parent.session_id, nowIso());
    });
  },

  async reorderExercises(sessionId, orderedIds) {
    const db = await getDatabase();
    const now = nowIso();
    await db.withTransactionAsync(async () => {
      for (let order = 0; order < orderedIds.length; order += 1) {
        const id = orderedIds[order];
        if (!id) {
          continue;
        }
        await db.runAsync(
          `UPDATE workout_session_exercises
           SET sort_order = ?, updated_at = ?
           WHERE id = ? AND workout_session_id = ?`,
          order,
          now,
          id,
          sessionId,
        );
      }
      await touchSession(db, sessionId, now);
    });
  },

  async latestCompletedSets(exerciseId, excludeSessionId, beforeCompletedAt) {
    const db = await getDatabase();
    return loadLatestCompletedSets(db, exerciseId, excludeSessionId, beforeCompletedAt);
  },
};

class ActiveSessionExistsError extends Error {
  constructor() {
    super('An active workout already exists.');
    this.name = 'ActiveSessionExistsError';
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function isUniqueConstraint(error: unknown): boolean {
  return error instanceof Error && error.message.includes('UNIQUE constraint failed');
}

async function insertDefaultSets(
  db: SQLite.SQLiteDatabase,
  sessionExerciseId: string,
  exerciseId: string,
  now: string,
): Promise<void> {
  const loggingType = await loggingTypeFor(db, exerciseId);
  const history = await loadLatestCompletedSets(db, exerciseId, null, null);
  const weight = rememberedWorkingWeight(
    loggingType,
    history.map((set) => ({
      weight: set.weight,
      reps: set.reps,
      durationSeconds: set.durationSeconds,
      isCompleted: true,
      sortOrder: set.sortOrder,
    })),
  );
  for (let order = 0; order < DEFAULT_SET_COUNT; order += 1) {
    await db.runAsync(
      `INSERT INTO workout_sets
         (id, workout_session_exercise_id, sort_order, weight, reps, duration_seconds, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, NULL, 0, ?, ?)`,
      createId('set'),
      sessionExerciseId,
      order,
      loggingType === 'reps' ? null : weight,
      now,
      now,
    );
  }
}

async function loggingTypeFor(db: SQLite.SQLiteDatabase, exerciseId: string): Promise<ExerciseLoggingType> {
  const row = await db.getFirstAsync<{ logging_type: string }>(
    'SELECT logging_type FROM exercises WHERE id = ?',
    exerciseId,
  );
  if (row && isExerciseLoggingType(row.logging_type)) {
    return row.logging_type;
  }
  return 'weight_reps';
}

async function loadLatestCompletedSets(
  db: SQLite.SQLiteDatabase,
  exerciseId: string,
  excludeSessionId: string | null,
  beforeCompletedAt: string | null,
): Promise<CompletedSetRecord[]> {
  const match = await db.getFirstAsync<{ exercise_row_id: string }>(
    `SELECT e.id AS exercise_row_id
     FROM workout_sessions sess
     INNER JOIN workout_session_exercises e ON e.workout_session_id = sess.id
     INNER JOIN workout_sets s ON s.workout_session_exercise_id = e.id
     WHERE e.exercise_id = ?
       AND sess.status = 'completed'
       AND s.is_completed = 1
       AND (
         (s.reps IS NOT NULL AND s.reps >= 1)
         OR (s.duration_seconds IS NOT NULL AND s.duration_seconds >= 1)
       )
       AND (? IS NULL OR sess.id != ?)
       AND (? IS NULL OR sess.completed_at < ?)
     ORDER BY sess.completed_at DESC, sess.id DESC
     LIMIT 1`,
    exerciseId,
    excludeSessionId,
    excludeSessionId,
    beforeCompletedAt,
    beforeCompletedAt,
  );
  if (!match) {
    return [];
  }
  return loadCompletedSetRecords(db, match.exercise_row_id);
}

async function loadCompletedSetRecords(
  db: SQLite.SQLiteDatabase,
  sessionExerciseId: string,
): Promise<CompletedSetRecord[]> {
  const rows = await db.getAllAsync<{
    weight: number | null;
    reps: number | null;
    duration_seconds: number | null;
    sort_order: number;
  }>(
    `SELECT weight, reps, duration_seconds, sort_order
     FROM workout_sets
     WHERE workout_session_exercise_id = ?
       AND is_completed = 1
       AND (
         (reps IS NOT NULL AND reps >= 1)
         OR (duration_seconds IS NOT NULL AND duration_seconds >= 1)
       )`,
    sessionExerciseId,
  );
  return rows.map((row) => ({
    weight: row.weight == null ? null : Number(row.weight),
    reps: row.reps == null ? null : Number(row.reps),
    durationSeconds: row.duration_seconds == null ? null : Number(row.duration_seconds),
    sortOrder: Number(row.sort_order),
  }));
}

async function touchSession(db: SQLite.SQLiteDatabase, sessionId: string, now: string): Promise<void> {
  await db.runAsync('UPDATE workout_sessions SET updated_at = ? WHERE id = ?', now, sessionId);
}

async function renumberExercises(db: SQLite.SQLiteDatabase, sessionId: string): Promise<void> {
  const rows = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM workout_session_exercises WHERE workout_session_id = ? ORDER BY sort_order ASC',
    sessionId,
  );
  for (let order = 0; order < rows.length; order += 1) {
    const row = rows[order];
    if (!row) {
      continue;
    }
    await db.runAsync('UPDATE workout_session_exercises SET sort_order = ? WHERE id = ?', order, row.id);
  }
}

async function renumberSets(db: SQLite.SQLiteDatabase, sessionExerciseId: string): Promise<void> {
  const rows = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM workout_sets WHERE workout_session_exercise_id = ? ORDER BY sort_order ASC',
    sessionExerciseId,
  );
  for (let order = 0; order < rows.length; order += 1) {
    const row = rows[order];
    if (!row) {
      continue;
    }
    await db.runAsync('UPDATE workout_sets SET sort_order = ? WHERE id = ?', order, row.id);
  }
}

async function loadSession(db: SQLite.SQLiteDatabase, id: string): Promise<StrengthSession | null> {
  const row = await db.getFirstAsync<SessionRow>(
    `SELECT id, source_template_id, name, status, started_at, completed_at, created_at, updated_at
     FROM workout_sessions
     WHERE id = ?`,
    id,
  );
  if (!row || !isStrengthSessionStatus(row.status)) {
    return null;
  }
  const exerciseRows = await db.getAllAsync<ExerciseRow>(
    `SELECT link.id, link.exercise_id, link.exercise_name_snapshot, link.sort_order, link.note,
            link.created_at, link.updated_at, exercise.logging_type
     FROM workout_session_exercises link
     LEFT JOIN exercises exercise ON exercise.id = link.exercise_id
     WHERE link.workout_session_id = ?
     ORDER BY link.sort_order ASC`,
    id,
  );
  const setRows = await db.getAllAsync<SetRow>(
    `SELECT s.id, s.workout_session_exercise_id, s.sort_order, s.weight, s.reps, s.duration_seconds,
            s.is_completed, s.created_at, s.updated_at
     FROM workout_sets s
     INNER JOIN workout_session_exercises e ON e.id = s.workout_session_exercise_id
     WHERE e.workout_session_id = ?
     ORDER BY s.sort_order ASC`,
    id,
  );
  const setsByExercise = new Map<string, StrengthSet[]>();
  for (const setRow of setRows) {
    const list = setsByExercise.get(setRow.workout_session_exercise_id) ?? [];
    list.push(toSet(setRow));
    setsByExercise.set(setRow.workout_session_exercise_id, list);
  }
  const exercises: StrengthSessionExercise[] = exerciseRows.map((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exercise_id,
    exerciseNameSnapshot: exercise.exercise_name_snapshot,
    loggingType: isExerciseLoggingType(exercise.logging_type) ? exercise.logging_type : 'weight_reps',
    sortOrder: Number(exercise.sort_order),
    note: exercise.note,
    sets: setsByExercise.get(exercise.id) ?? [],
    createdAt: exercise.created_at,
    updatedAt: exercise.updated_at,
  }));
  return {
    id: row.id,
    sourceTemplateId: row.source_template_id,
    name: row.name,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    exercises,
  };
}

function toSet(row: SetRow): StrengthSet {
  return {
    id: row.id,
    sortOrder: Number(row.sort_order),
    weight: row.weight == null ? null : Number(row.weight),
    reps: row.reps == null ? null : Number(row.reps),
    durationSeconds: row.duration_seconds == null ? null : Number(row.duration_seconds),
    isCompleted: row.is_completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
