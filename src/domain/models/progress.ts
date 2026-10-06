export type ProgressCategory = 'strength' | 'running' | 'body' | 'consistency';

export type HistoryPoint = {
  occurredAt: string;
  weightLb: number;
  reps: number;
};

export type ExerciseHistory = {
  id: string;
  exerciseName: string;
  category: ProgressCategory;
  points: HistoryPoint[];
};
