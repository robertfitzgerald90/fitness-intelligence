import type { ExerciseCategory } from '@/domain/models/exercise';

export type BuiltinExercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
};

export const builtinExercises: BuiltinExercise[] = [
  { id: 'ex-machine-bench-press', name: 'Machine Bench Press', category: 'Chest' },
  { id: 'ex-bench-press', name: 'Bench Press', category: 'Chest' },
  { id: 'ex-incline-dumbbell-bench-press', name: 'Incline Dumbbell Bench Press', category: 'Chest' },
  { id: 'ex-dumbbell-fly', name: 'Dumbbell Fly', category: 'Chest' },
  { id: 'ex-cable-fly', name: 'Cable Fly', category: 'Chest' },
  { id: 'ex-push-up', name: 'Push-Up', category: 'Chest' },

  { id: 'ex-lat-pulldown', name: 'Lat Pulldown', category: 'Back' },
  { id: 'ex-cable-row', name: 'Cable Row', category: 'Back' },
  { id: 'ex-barbell-row', name: 'Barbell Row', category: 'Back' },
  { id: 'ex-seated-row', name: 'Seated Row', category: 'Back' },
  { id: 'ex-pull-up', name: 'Pull-Up', category: 'Back' },
  { id: 'ex-face-pull', name: 'Face Pull', category: 'Back' },

  { id: 'ex-shoulder-press', name: 'Shoulder Press', category: 'Shoulders' },
  { id: 'ex-dumbbell-lateral-raise', name: 'Dumbbell Lateral Raise', category: 'Shoulders' },
  { id: 'ex-rear-delt-fly', name: 'Rear Delt Fly', category: 'Shoulders' },
  { id: 'ex-arnold-press', name: 'Arnold Press', category: 'Shoulders' },

  { id: 'ex-hammer-curl', name: 'Hammer Curl', category: 'Biceps' },
  { id: 'ex-cable-curl', name: 'Cable Curl', category: 'Biceps' },
  { id: 'ex-dumbbell-curl', name: 'Dumbbell Curl', category: 'Biceps' },
  { id: 'ex-barbell-curl', name: 'Barbell Curl', category: 'Biceps' },

  { id: 'ex-tricep-pushdown', name: 'Tricep Pushdown', category: 'Triceps' },
  { id: 'ex-tricep-extension', name: 'Tricep Extension', category: 'Triceps' },
  { id: 'ex-overhead-tricep-extension', name: 'Overhead Tricep Extension', category: 'Triceps' },
  { id: 'ex-dip', name: 'Dip', category: 'Triceps' },

  { id: 'ex-leg-press', name: 'Leg Press', category: 'Legs' },
  { id: 'ex-leg-curl', name: 'Leg Curl', category: 'Legs' },
  { id: 'ex-back-squat', name: 'Back Squat', category: 'Legs' },
  { id: 'ex-romanian-deadlift', name: 'Romanian Deadlift', category: 'Legs' },
  { id: 'ex-leg-extension', name: 'Leg Extension', category: 'Legs' },
  { id: 'ex-walking-lunge', name: 'Walking Lunge', category: 'Legs' },
  { id: 'ex-calf-raise', name: 'Calf Raise', category: 'Legs' },

  { id: 'ex-plank', name: 'Plank', category: 'Core' },
  { id: 'ex-cable-crunch', name: 'Cable Crunch', category: 'Core' },
  { id: 'ex-hanging-leg-raise', name: 'Hanging Leg Raise', category: 'Core' },
  { id: 'ex-dead-bug', name: 'Dead Bug', category: 'Core' },
];
