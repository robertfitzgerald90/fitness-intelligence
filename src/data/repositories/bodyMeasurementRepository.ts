import type { BodyMeasurement, WeightUnit } from '@/domain/models/body';

export type SaveBodyMeasurementInput = {
  id: string | null;
  weight: number;
  weightUnit: WeightUnit;
  bodyFatPercent: number | null;
  recordedAt: string;
};

export type BodyMeasurementRepository = {
  list(): Promise<BodyMeasurement[]>;
  getById(id: string): Promise<BodyMeasurement | null>;
  save(input: SaveBodyMeasurementInput): Promise<BodyMeasurement>;
  delete(id: string): Promise<void>;
};
