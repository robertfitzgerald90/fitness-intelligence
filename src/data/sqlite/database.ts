import * as SQLite from 'expo-sqlite';

import { builtinExercises } from '@/data/seed/exerciseCatalog';
import { starterTemplates } from '@/data/seed/starterTemplates';

const DATABASE_VERSION = 1;
const SEEDED_AT = '2026-01-01T00:00:00.000Z';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabase().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('fitness-intelligence.db');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrate(db);
  return db;
}

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        is_custom INTEGER NOT NULL,
        is_favorite INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workout_templates (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workout_template_exercises (
        id TEXT PRIMARY KEY NOT NULL,
        workout_template_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        FOREIGN KEY (workout_template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );
      CREATE INDEX IF NOT EXISTS idx_template_exercises_order
        ON workout_template_exercises (workout_template_id, sort_order);
    `);
    await seedFreshDatabase(db);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

async function seedFreshDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const exercise of builtinExercises) {
      await db.runAsync(
        `INSERT INTO exercises (id, name, category, is_custom, is_favorite, created_at, updated_at)
         VALUES (?, ?, ?, 0, 0, ?, ?)`,
        exercise.id,
        exercise.name,
        exercise.category,
        SEEDED_AT,
        SEEDED_AT,
      );
    }

    for (let templateIndex = 0; templateIndex < starterTemplates.length; templateIndex += 1) {
      const template = starterTemplates[templateIndex];
      if (!template) {
        continue;
      }
      const createdAt = new Date(Date.parse(SEEDED_AT) + templateIndex * 1000).toISOString();
      await db.runAsync(
        'INSERT INTO workout_templates (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)',
        template.id,
        template.name,
        createdAt,
        createdAt,
      );
      for (let order = 0; order < template.exerciseIds.length; order += 1) {
        const exerciseId = template.exerciseIds[order];
        if (!exerciseId) {
          continue;
        }
        await db.runAsync(
          `INSERT INTO workout_template_exercises
             (id, workout_template_id, exercise_id, sort_order)
           VALUES (?, ?, ?, ?)`,
          `${template.id}-${order}`,
          template.id,
          exerciseId,
          order,
        );
      }
    }
  });
}
