import type { ScenarioId } from '@/data/seed/scenario';
import type { WorkoutSession } from '@/domain/models/workout';

type SeedWorkout = Omit<WorkoutSession, 'completedAt'> & {
  daysAgo: number;
  hour: number;
};

const upperBody = (daysAgo: number, hour = 18): SeedWorkout => ({
  id: 'workout-upper-body',
  title: 'Upper Body',
  activityType: 'strength',
  focus: 'upper',
  daysAgo,
  hour,
  durationMinutes: 48,
  exerciseCount: 8,
  setCount: 24,
  highlights: [
    { exerciseName: 'Machine Bench Press', weightLb: 110, reps: 10 },
    { exerciseName: 'Lat Pulldown', weightLb: 100, reps: 10 },
    { exerciseName: 'Cable Row', weightLb: 75, reps: 10 },
  ],
  progressedExerciseCount: 3,
});

const lowerBody: SeedWorkout = {
  id: 'workout-lower-body',
  title: 'Lower Body',
  activityType: 'strength',
  focus: 'lower',
  daysAgo: 1,
  hour: 18,
  durationMinutes: 46,
  exerciseCount: 6,
  setCount: 18,
  highlights: [
    { exerciseName: 'Back Squat', weightLb: 185, reps: 5 },
    { exerciseName: 'Romanian Deadlift', weightLb: 155, reps: 8 },
    { exerciseName: 'Leg Press', weightLb: 320, reps: 10 },
  ],
  progressedExerciseCount: 2,
};

const completedUpperBody: SeedWorkout = {
  id: 'workout-upper-body-today',
  title: 'Upper Body',
  activityType: 'strength',
  focus: 'upper',
  daysAgo: 0,
  hour: 7,
  durationMinutes: 52,
  exerciseCount: 8,
  setCount: 24,
  highlights: [
    { exerciseName: 'Machine Bench Press', weightLb: 110, reps: 12 },
    { exerciseName: 'Cable Row', weightLb: 75, reps: 10 },
    { exerciseName: 'Lat Pulldown', weightLb: 100, reps: 11 },
  ],
  progressedExerciseCount: 4,
};

export function seedWorkouts(scenario: ScenarioId): SeedWorkout[] {
  switch (scenario) {
    case 'returning':
      return [lowerBody, upperBody(4)];
    case 'lapsed':
      return [upperBody(8)];
    case 'postWorkout':
      return [completedUpperBody];
    case 'new':
      return [];
    default: {
      const exhaustive: never = scenario;
      return exhaustive;
    }
  }
}
