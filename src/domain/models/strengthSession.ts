import type { ExerciseLoggingType } from '@/domain/models/exercise';

export type StrengthSessionStatus = 'active' | 'completed';

export type StrengthSet = {
  id: string;
  sortOrder: number;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StrengthSessionExercise = {
  id: string;
  exerciseId: string;
  exerciseNameSnapshot: string;
  loggingType: ExerciseLoggingType;
  sortOrder: number;
  note: string | null;
  sets: StrengthSet[];
  createdAt: string;
  updatedAt: string;
};

export type StrengthSession = {
  id: string;
  sourceTemplateId: string | null;
  name: string;
  status: StrengthSessionStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: StrengthSessionExercise[];
};

export function isStrengthSessionStatus(value: string): value is StrengthSessionStatus {
  return value === 'active' || value === 'completed';
}
