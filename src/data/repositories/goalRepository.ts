import type { PersonalGoal, PersonalGoalType } from '@/domain/models/personalGoal';
import type { ExerciseLoggingType } from '@/domain/models/exercise';
import type { WeightUnit } from '@/domain/models/body';

export type SaveGoalInput = {
  id: string | null;
  type: Exclude<PersonalGoalType, 'running'>;
  targetWeight: number | null;
  weightUnit: WeightUnit | null;
  exerciseId: string | null;
  exerciseName: string | null;
  loggingType: ExerciseLoggingType | null;
  targetReps: number | null;
  targetDurationSeconds: number | null;
  workoutsPerWeek: number | null;
};

export type GoalRepository = {
  list(): Promise<PersonalGoal[]>;
  getById(id: string): Promise<PersonalGoal | null>;
  save(input: SaveGoalInput): Promise<PersonalGoal>;
  delete(id: string): Promise<void>;
};
