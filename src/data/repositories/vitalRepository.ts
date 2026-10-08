import type { BloodPressureReading } from '@/domain/models/vitals';

export type SaveBloodPressureInput = {
  id: string | null;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  recordedAt: string;
};

export type VitalRepository = {
  list(): Promise<BloodPressureReading[]>;
  getById(id: string): Promise<BloodPressureReading | null>;
  save(input: SaveBloodPressureInput): Promise<BloodPressureReading>;
  delete(id: string): Promise<void>;
};
