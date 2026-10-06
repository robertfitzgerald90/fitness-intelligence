import type { Goal } from '@/domain/models/goal';
import type { UserProfile } from '@/domain/models/profile';
import type { ExerciseHistory } from '@/domain/models/progress';
import type { WorkoutSession } from '@/domain/models/workout';

export interface ProfileRepository {
  getProfile(): Promise<UserProfile>;
}

export interface WorkoutRepository {
  getSessions(now: Date): Promise<WorkoutSession[]>;
}

export interface ExerciseHistoryRepository {
  getHighlighted(now: Date): Promise<ExerciseHistory | null>;
}

export interface GoalRepository {
  getActive(limit: number): Promise<Goal[]>;
}
