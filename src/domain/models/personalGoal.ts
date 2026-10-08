import type { ExerciseLoggingType } from '@/domain/models/exercise';
import type { WeightUnit } from '@/domain/models/body';

export const personalGoalTypes = ['body_weight', 'strength', 'training_frequency', 'running'] as const;

export type PersonalGoalType = (typeof personalGoalTypes)[number];

type PersonalGoalBase = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type BodyWeightGoal = PersonalGoalBase & {
  type: 'body_weight';
  targetWeight: number;
  weightUnit: WeightUnit;
};

export type StrengthGoal = PersonalGoalBase & {
  type: 'strength';
  exerciseId: string | null;
  exerciseName: string;
  loggingType: ExerciseLoggingType;
  targetWeight: number | null;
  targetReps: number | null;
  targetDurationSeconds: number | null;
};

export type TrainingFrequencyGoal = PersonalGoalBase & {
  type: 'training_frequency';
  workoutsPerWeek: number;
};

export type RunningGoal = PersonalGoalBase & {
  type: 'running';
};

export type PersonalGoal = BodyWeightGoal | StrengthGoal | TrainingFrequencyGoal | RunningGoal;
