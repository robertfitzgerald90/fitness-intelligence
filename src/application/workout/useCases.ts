import { trainContainer } from '@/application/train/container';
import type { SessionDraft } from '@/application/train/drafts';
import { getWorkoutTemplate } from '@/application/train/useCases';
import { isUsableLoggedSet, formatLoggedSet, performanceComparison } from '@/application/workout/format';
import {
  representativeExercisePerformance,
  type ExercisePerformance,
} from '@/domain/analytics/workingWeight';
import type { ExerciseLoggingType } from '@/domain/models/exercise';
import type { StrengthSession, StrengthSet } from '@/domain/models/strengthSession';

const writeTails = new Map<string, Promise<void>>();

function enqueueWrite(key: string, task: () => Promise<void>): Promise<void> {
  const previous = writeTails.get(key) ?? Promise.resolve();
  const next = previous.then(task, task);
  writeTails.set(
    key,
    next.then(
      () => undefined,
      () => undefined,
    ),
  );
  return next;
}

export function flushWorkoutWrites(): Promise<void> {
  return Promise.all([...writeTails.values()]).then(() => undefined);
}

export async function getActiveWorkout(): Promise<StrengthSession | null> {
  return trainContainer.sessions.getActive();
}

export async function getWorkoutSession(id: string): Promise<StrengthSession | null> {
  return trainContainer.sessions.getById(id);
}

export async function beginWorkout(
  draft: SessionDraft,
): Promise<{ ok: true; session: StrengthSession } | { ok: false; reason: 'empty' | 'active' | 'name' }> {
  const name = draft.name.trim();
  if (name.length === 0) {
    return { ok: false, reason: 'name' };
  }
  if (draft.exercises.length === 0) {
    return { ok: false, reason: 'empty' };
  }
  const template = await getWorkoutTemplate(draft.templateId);
  return trainContainer.sessions.createActive({
    sourceTemplateId: template?.id ?? null,
    name,
    exercises: draft.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
    })),
  });
}

export async function discardWorkout(id: string): Promise<boolean> {
  await flushWorkoutWrites();
  return trainContainer.sessions.discardActive(id);
}

export async function finishWorkout(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: 'missing' | 'not-active' | 'no-sets' }> {
  await flushWorkoutWrites();
  return trainContainer.sessions.finish(id);
}

export function saveWorkoutSet(input: {
  setId: string;
  loggingType: ExerciseLoggingType;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  isCompleted: boolean;
}): Promise<{ ok: true } | { ok: false; reason: 'values' | 'missing' }> {
  const usable = isUsableLoggedSet(input.loggingType, input.weight, input.reps, input.durationSeconds);
  if (input.isCompleted && !usable) {
    return Promise.resolve({ ok: false, reason: 'values' });
  }
  const isCompleted = input.isCompleted && usable;
  return enqueueWrite(input.setId, async () => {
    const saved = await trainContainer.sessions.updateSet({
      setId: input.setId,
      weight: input.weight,
      reps: input.reps,
      durationSeconds: input.durationSeconds,
      isCompleted,
    });
    if (!saved) {
      throw new SetMissingError();
    }
  }).then(
    () => ({ ok: true as const }),
    (error: unknown) => {
      if (error instanceof SetMissingError) {
        return { ok: false as const, reason: 'missing' as const };
      }
      throw error;
    },
  );
}

export async function addWorkoutSet(sessionExerciseId: string): Promise<StrengthSet | null> {
  await flushWorkoutWrites();
  return trainContainer.sessions.addSet(sessionExerciseId);
}

export async function removeWorkoutSet(setId: string): Promise<void> {
  await flushWorkoutWrites();
  await trainContainer.sessions.removeSet(setId);
}

export function saveExerciseNote(sessionExerciseId: string, note: string): Promise<void> {
  const trimmed = note.trim();
  return enqueueWrite(`note-${sessionExerciseId}`, () =>
    trainContainer.sessions.updateNote(sessionExerciseId, trimmed.length === 0 ? null : trimmed),
  );
}

export async function renameWorkout(
  sessionId: string,
  name: string,
): Promise<{ ok: true } | { ok: false; reason: 'name' | 'missing' }> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'name' };
  }
  const saved = await trainContainer.sessions.rename(sessionId, trimmed);
  return saved ? { ok: true } : { ok: false, reason: 'missing' };
}

export async function addExerciseToWorkout(
  sessionId: string,
  exercise: { exerciseId: string; name: string },
): Promise<'added' | 'duplicate' | 'missing'> {
  return trainContainer.sessions.addExercise(sessionId, exercise);
}

export async function removeWorkoutExercise(sessionExerciseId: string): Promise<void> {
  await flushWorkoutWrites();
  await trainContainer.sessions.removeExercise(sessionExerciseId);
}

export async function moveWorkoutExercise(
  sessionId: string,
  index: number,
  direction: -1 | 1,
): Promise<void> {
  const session = await trainContainer.sessions.getById(sessionId);
  if (!session) {
    return;
  }
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= session.exercises.length) {
    return;
  }
  const orderedIds = session.exercises.map((exercise) => exercise.id);
  const [moved] = orderedIds.splice(index, 1);
  if (!moved) {
    return;
  }
  orderedIds.splice(nextIndex, 0, moved);
  await trainContainer.sessions.reorderExercises(sessionId, orderedIds);
}

export async function getPreviousPerformance(
  exerciseId: string,
  loggingType: ExerciseLoggingType,
  excludeSessionId: string | null,
  beforeCompletedAt: string | null,
): Promise<ExercisePerformance | null> {
  const sets = await trainContainer.sessions.latestCompletedSets(exerciseId, excludeSessionId, beforeCompletedAt);
  return representativeExercisePerformance(
    loggingType,
    sets.map((set) => ({
      weight: set.weight,
      reps: set.reps,
      durationSeconds: set.durationSeconds,
      isCompleted: true,
      sortOrder: set.sortOrder,
    })),
  );
}

export type WorkoutExerciseSummary = {
  id: string;
  name: string;
  note: string | null;
  sets: { id: string; line: string }[];
  comparison: ReturnType<typeof performanceComparison>;
};

export type WorkoutSummary = {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string;
  exerciseCount: number;
  setCount: number;
  exercises: WorkoutExerciseSummary[];
};

export async function getWorkoutSummary(sessionId: string): Promise<WorkoutSummary | null> {
  const session = await trainContainer.sessions.getById(sessionId);
  if (!session || session.status !== 'completed' || !session.completedAt) {
    return null;
  }
  const exercises: WorkoutExerciseSummary[] = [];
  for (const exercise of session.exercises) {
    const current = representativeExercisePerformance(exercise.loggingType, exercise.sets);
    if (!current) {
      continue;
    }
    const previous = await getPreviousPerformance(
      exercise.exerciseId,
      exercise.loggingType,
      session.id,
      session.completedAt,
    );
    const lines = exercise.sets.flatMap((set) => {
      const line = formatLoggedSet(exercise.loggingType, set);
      return line ? [{ id: set.id, line }] : [];
    });
    exercises.push({
      id: exercise.id,
      name: exercise.exerciseNameSnapshot,
      note: exercise.note,
      sets: lines,
      comparison: performanceComparison(current, previous),
    });
  }
  const setCount = exercises.reduce((count, exercise) => count + exercise.sets.length, 0);
  return {
    id: session.id,
    name: session.name,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    exerciseCount: exercises.length,
    setCount,
    exercises,
  };
}

class SetMissingError extends Error {
  constructor() {
    super('Set is no longer available.');
    this.name = 'SetMissingError';
  }
}
