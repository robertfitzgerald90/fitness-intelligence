export const weightUnits = ['lb', 'kg'] as const;

export type WeightUnit = (typeof weightUnits)[number];

export function isWeightUnit(value: string): value is WeightUnit {
  return (weightUnits as readonly string[]).includes(value);
}

/** One logged body entry. Future measurements can be added beside weight without replacing this record. */
export type BodyMeasurement = {
  id: string;
  weight: number;
  weightUnit: WeightUnit;
  bodyFatPercent: number | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
};
