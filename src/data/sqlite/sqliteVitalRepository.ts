import { createId } from '@/data/sqlite/createId';
import { getDatabase } from '@/data/sqlite/database';
import type { SaveBloodPressureInput, VitalRepository } from '@/data/repositories/vitalRepository';
import type { BloodPressureReading } from '@/domain/models/vitals';

type ReadingRow = {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function toReading(row: ReadingRow): BloodPressureReading {
  return {
    id: row.id,
    systolic: row.systolic,
    diastolic: row.diastolic,
    pulse: row.pulse,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const sqliteVitalRepository: VitalRepository = {
  async list() {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ReadingRow>(
      `SELECT id, systolic, diastolic, pulse, recorded_at, created_at, updated_at
       FROM blood_pressure_readings
       ORDER BY recorded_at DESC, id DESC`,
    );
    return rows.map(toReading);
  },

  async getById(id) {
    const db = await getDatabase();
    const row = await db.getFirstAsync<ReadingRow>(
      `SELECT id, systolic, diastolic, pulse, recorded_at, created_at, updated_at
       FROM blood_pressure_readings
       WHERE id = ?`,
      id,
    );
    return row ? toReading(row) : null;
  },

  async save(input: SaveBloodPressureInput) {
    const db = await getDatabase();
    const updatedAt = nowIso();
    if (input.id) {
      await db.runAsync(
        `UPDATE blood_pressure_readings
         SET systolic = ?, diastolic = ?, pulse = ?, recorded_at = ?, updated_at = ?
         WHERE id = ?`,
        input.systolic,
        input.diastolic,
        input.pulse,
        input.recordedAt,
        updatedAt,
        input.id,
      );
      const saved = await this.getById(input.id);
      if (!saved) {
        throw new Error('Blood pressure reading was not saved.');
      }
      return saved;
    }
    const id = createId('bp');
    await db.runAsync(
      `INSERT INTO blood_pressure_readings (
         id, systolic, diastolic, pulse, recorded_at, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.systolic,
      input.diastolic,
      input.pulse,
      input.recordedAt,
      updatedAt,
      updatedAt,
    );
    const saved = await this.getById(id);
    if (!saved) {
      throw new Error('Blood pressure reading was not saved.');
    }
    return saved;
  },

  async delete(id) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM blood_pressure_readings WHERE id = ?', id);
  },
};
