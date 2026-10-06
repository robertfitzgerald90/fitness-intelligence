import { activeScenario } from '@/data/seed/scenario';
import {
  seedExerciseHistoryRepository,
  seedGoalRepository,
  seedProfileRepository,
  seedWorkoutRepository,
} from '@/data/seed/seedRepositories';

export const container = {
  scenario: activeScenario,
  profile: seedProfileRepository,
  workouts: seedWorkoutRepository,
  history: seedExerciseHistoryRepository,
  goals: seedGoalRepository,
};
