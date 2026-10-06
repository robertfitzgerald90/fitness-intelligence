import { atDaysAgo } from '@/data/seed/dates';
import { highlightedHistoryId, seedHistories } from '@/data/seed/exerciseHistory';
import { seedGoals } from '@/data/seed/goals';
import { seedProfile } from '@/data/seed/profile';
import { activeScenario } from '@/data/seed/scenario';
import { seedWorkouts } from '@/data/seed/workouts';
import type {
  ExerciseHistoryRepository,
  GoalRepository,
  ProfileRepository,
  WorkoutRepository,
} from '@/data/repositories/contracts';

export const seedProfileRepository: ProfileRepository = {
  async getProfile() {
    return seedProfile;
  },
};

export const seedWorkoutRepository: WorkoutRepository = {
  async getSessions(now) {
    return seedWorkouts(activeScenario).map((workout) => ({
      id: workout.id,
      title: workout.title,
      activityType: workout.activityType,
      focus: workout.focus,
      completedAt: atDaysAgo(now, workout.daysAgo, workout.hour),
      durationMinutes: workout.durationMinutes,
      exerciseCount: workout.exerciseCount,
      setCount: workout.setCount,
      highlights: workout.highlights,
      progressedExerciseCount: workout.progressedExerciseCount,
    }));
  },
};

export const seedExerciseHistoryRepository: ExerciseHistoryRepository = {
  async getHighlighted(now) {
    const history = seedHistories(activeScenario).find((item) => item.id === highlightedHistoryId);
    if (!history) {
      return null;
    }

    return {
      id: history.id,
      exerciseName: history.exerciseName,
      category: history.category,
      points: history.points.map((point) => ({
        occurredAt: atDaysAgo(now, point.daysAgo, 18),
        weightLb: point.weightLb,
        reps: point.reps,
      })),
    };
  },
};

export const seedGoalRepository: GoalRepository = {
  async getActive(limit) {
    return seedGoals(activeScenario).slice(0, limit);
  },
};
