import type { StrengthSession, StrengthSet } from '@/domain/models/strengthSession';

export type SessionExerciseInput = {
  exerciseId: string;
  name: string;
};

export type CreateActiveSessionInput = {
  sourceTemplateId: string | null;
  name: string;
  exercises: SessionExerciseInput[];
};

export type UpdateStrengthSetInput = {
  setId: string;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  isCompleted: boolean;
};

export type CompletedSessionInRange = {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string;
  exerciseCount: number;
  completedSetCount: number;
};

export type CompletedSetRecord = {
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  sortOrder: number;
};

export type WorkoutSessionRepository = {
  getActive(): Promise<StrengthSession | null>;
  getById(id: string): Promise<StrengthSession | null>;
  createActive(
    input: CreateActiveSessionInput,
  ): Promise<{ ok: true; session: StrengthSession } | { ok: false; reason: 'active' }>;
  discardActive(id: string): Promise<boolean>;
  finish(id: string): Promise<{ ok: true } | { ok: false; reason: 'missing' | 'not-active' | 'no-sets' }>;
  updateSet(input: UpdateStrengthSetInput): Promise<boolean>;
  addSet(sessionExerciseId: string): Promise<StrengthSet | null>;
  removeSet(setId: string): Promise<void>;
  updateNote(sessionExerciseId: string, note: string | null): Promise<void>;
  rename(sessionId: string, name: string): Promise<boolean>;
  addExercise(sessionId: string, exercise: SessionExerciseInput): Promise<'added' | 'duplicate' | 'missing'>;
  removeExercise(sessionExerciseId: string): Promise<void>;
  reorderExercises(sessionId: string, orderedIds: string[]): Promise<void>;
  latestCompletedSets(
    exerciseId: string,
    excludeSessionId: string | null,
    beforeCompletedAt: string | null,
  ): Promise<CompletedSetRecord[]>;
  getCompletedSessionsInRange(startInclusive: string, endExclusive: string): Promise<CompletedSessionInRange[]>;
};
