export type ActivityType = 'strength' | 'run' | 'recovery';

export type TrainingFocus = 'upper' | 'lower' | 'full' | 'other';

export type ExerciseHighlight = {
  exerciseName: string;
  weightLb: number;
  reps: number;
};

export type WorkoutSession = {
  id: string;
  title: string;
  activityType: ActivityType;
  focus: TrainingFocus;
  completedAt: string;
  durationMinutes: number;
  exerciseCount: number;
  setCount: number;
  highlights: ExerciseHighlight[];
  progressedExerciseCount: number;
};
