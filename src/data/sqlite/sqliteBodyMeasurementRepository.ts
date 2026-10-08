import { createId } from '@/data/sqlite/createId';
import { getDatabase } from '@/data/sqlite/database';
import type {
  BodyMeasurementRepository,
  SaveBodyMeasurementInput,
} from '@/data/repositories/bodyMeasurementRepository';
import { isWeightUnit, type BodyMeasurement } from '@/domain/models/body';

type BodyRow = {
  id: string;
  weight: number;
  weight_unit: string;
  body_fat_percent: number | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function toMeasurement(row: BodyRow): BodyMeasurement | null {
  if (!isWeightUnit(row.weight_unit)) {
    return null;
  }
  return {
    id: row.id,
    weight: row.weight,
    weightUnit: row.weight_unit,
    bodyFatPercent: row.body_fat_percent,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const sqliteBodyMeasurementRepository: BodyMeasurementRepository = {
  async list() {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BodyRow>(
      `SELECT id, weight, weight_unit, body_fat_percent, recorded_at, created_at, updated_at
       FROM body_measurements
       ORDER BY recorded_at DESC, id DESC`,
    );
    return rows.flatMap((row) => {
      const measurement = toMeasurement(row);
      return measurement ? [measurement] : [];
    });
  },

  async getById(id) {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BodyRow>(
      `SELECT id, weight, weight_unit, body_fat_percent, recorded_at, created_at, updated_at
       FROM body_measurements
       WHERE id = ?`,
      id,
    );
    return row ? toMeasurement(row) : null;
  },

  async save(input: SaveBodyMeasurementInput) {
    const db = await getDatabase();
    const updatedAt = nowIso();
    if (input.id) {
      await db.runAsync(
        `UPDATE body_measurements
         SET weight = ?, weight_unit = ?, body_fat_percent = ?, recorded_at = ?, updated_at = ?
         WHERE id = ?`,
        input.weight,
        input.weightUnit,
        input.bodyFatPercent,
        input.recordedAt,
        updatedAt,
        input.id,
      );
      const saved = await this.getById(input.id);
      if (!saved) {
        throw new Error('Body measurement was not saved.');
      }
      return saved;
    }
    const id = createId('body');
    await db.runAsync(
      `INSERT INTO body_measurements (
         id, weight, weight_unit, body_fat_percent, recorded_at, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.weight,
      input.weightUnit,
      input.bodyFatPercent,
      input.recordedAt,
      updatedAt,
      updatedAt,
    );
    const saved = await this.getById(id);
    if (!saved) {
      throw new Error('Body measurement was not saved.');
    }
    return saved;
  },

  async delete(id) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM body_measurements WHERE id = ?', id);
  },
};
