import type { ExerciseCategory, ExerciseLoggingType } from '@/domain/models/exercise';

export type BuiltinExercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  loggingType: ExerciseLoggingType;
};

const loaded = 'weight_reps' satisfies ExerciseLoggingType;
const bodyweight = 'reps' satisfies ExerciseLoggingType;
const timed = 'duration_weight' satisfies ExerciseLoggingType;

export const builtinExercises: BuiltinExercise[] = [
  { id: 'ex-machine-bench-press', name: 'Machine Bench Press', category: 'Chest', loggingType: loaded },
  { id: 'ex-bench-press', name: 'Bench Press', category: 'Chest', loggingType: loaded },
  { id: 'ex-incline-dumbbell-bench-press', name: 'Incline Dumbbell Bench Press', category: 'Chest', loggingType: loaded },
  { id: 'ex-dumbbell-fly', name: 'Dumbbell Fly', category: 'Chest', loggingType: loaded },
  { id: 'ex-cable-fly', name: 'Cable Fly', category: 'Chest', loggingType: loaded },
  { id: 'ex-push-up', name: 'Push-Up', category: 'Chest', loggingType: bodyweight },

  { id: 'ex-lat-pulldown', name: 'Lat Pulldown', category: 'Back', loggingType: loaded },
  { id: 'ex-cable-row', name: 'Cable Row', category: 'Back', loggingType: loaded },
  { id: 'ex-barbell-row', name: 'Barbell Row', category: 'Back', loggingType: loaded },
  { id: 'ex-seated-row', name: 'Seated Row', category: 'Back', loggingType: loaded },
  { id: 'ex-pull-up', name: 'Pull-Up', category: 'Back', loggingType: bodyweight },
  { id: 'ex-face-pull', name: 'Face Pull', category: 'Back', loggingType: loaded },

  { id: 'ex-shoulder-press', name: 'Shoulder Press', category: 'Shoulders', loggingType: loaded },
  { id: 'ex-dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', category: 'Shoulders', loggingType: loaded },
  { id: 'ex-rear-delt-fly', name: 'Rear Delt Fly', category: 'Shoulders', loggingType: loaded },
  { id: 'ex-arnold-press', name: 'Arnold Press', category: 'Shoulders', loggingType: loaded },

  { id: 'ex-hammer-curl', name: 'Hammer Curl', category: 'Biceps', loggingType: loaded },
  { id: 'ex-cable-curl', name: 'Cable Curl', category: 'Biceps', loggingType: loaded },
  { id: 'ex-dumbbell-curl', name: 'Dumbbell Curl', category: 'Biceps', loggingType: loaded },
  { id: 'ex-barbell-curl', name: 'Barbell Curl', category: 'Biceps', loggingType: loaded },

  { id: 'ex-tricep-pushdown', name: 'Tricep Pushdown', category: 'Triceps', loggingType: loaded },
  { id: 'ex-tricep-extension', name: 'Tricep Extension', category: 'Triceps', loggingType: loaded },
  { id: 'ex-overhead-tricep-extension', name: 'Overhead Tricep Extension', category: 'Triceps', loggingType: loaded },
  { id: 'ex-dip', name: 'Dip', category: 'Triceps', loggingType: loaded },

  { id: 'ex-leg-press', name: 'Leg Press', category: 'Legs', loggingType: loaded },
  { id: 'ex-leg-curl', name: 'Leg Curl', category: 'Legs', loggingType: loaded },
  { id: 'ex-back-squat', name: 'Back Squat', category: 'Legs', loggingType: loaded },
  { id: 'ex-romanian-deadlift', name: 'Romanian Deadlift', category: 'Legs', loggingType: loaded },
  { id: 'ex-leg-extension', name: 'Leg Extension', category: 'Legs', loggingType: loaded },
  { id: 'ex-walking-lunge', name: 'Walking Lunge', category: 'Legs', loggingType: loaded },
  { id: 'ex-calf-raise', name: 'Calf Raise', category: 'Legs', loggingType: loaded },

  { id: 'ex-plank', name: 'Plank', category: 'Core', loggingType: timed },
  { id: 'ex-cable-crunch', name: 'Cable Crunch', category: 'Core', loggingType: loaded },
  { id: 'ex-hanging-leg-raise', name: 'Hanging Leg Raise', category: 'Core', loggingType: bodyweight },
  { id: 'ex-dead-bug', name: 'Dead Bug', category: 'Core', loggingType: bodyweight },
];
