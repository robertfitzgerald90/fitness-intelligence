import type { ExerciseLoggingType } from '@/domain/models/exercise';

export type WorkingSet = {
  weight: number | null;
  reps: number | null;
  durationSeconds?: number | null;
  isCompleted: boolean;
  sortOrder: number;
};

export type ExercisePerformance =
  | { loggingType: 'weight_reps'; weight: number; reps: number }
  | { loggingType: 'reps'; reps: number }
  | { loggingType: 'duration_weight'; durationSeconds: number; weight: number | null };

export type RepresentativePerformance = {
  weight: number;
  reps: number;
};

export type WeightComparison =
  | { kind: 'first' }
  | {
      kind: 'up';
      from: number;
      to: number;
      delta: number;
    }
  | { kind: 'same'; weight: number }
  | { kind: 'lower'; from: number; to: number };

function roundWeight(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Highest completed weight in the set list.
 * Ties keep the set with more reps, then the later set.
 */
export function representativePerformance(sets: WorkingSet[]): RepresentativePerformance | null {
  const completed = sets.filter(
    (set): set is WorkingSet & { weight: number; reps: number } =>
      set.isCompleted && set.weight != null && set.reps != null && set.reps >= 1,
  );
  if (completed.length === 0) {
    return null;
  }
  const best = completed.reduce((current, candidate) => {
    const currentWeight = roundWeight(current.weight);
    const candidateWeight = roundWeight(candidate.weight);
    if (candidateWeight !== currentWeight) {
      return candidateWeight > currentWeight ? candidate : current;
    }
    if (candidate.reps !== current.reps) {
      return candidate.reps > current.reps ? candidate : current;
    }
    return candidate.sortOrder > current.sortOrder ? candidate : current;
  });
  return { weight: roundWeight(best.weight), reps: best.reps };
}

export function compareWorkingWeight(
  current: RepresentativePerformance | null,
  previous: RepresentativePerformance | null,
): WeightComparison {
  if (!current || !previous) {
    return { kind: 'first' };
  }
  const from = roundWeight(previous.weight);
  const to = roundWeight(current.weight);
  const delta = roundWeight(to - from);
  if (delta > 0) {
    return { kind: 'up', from, to, delta };
  }
  if (delta < 0) {
    return { kind: 'lower', from, to };
  }
  return { kind: 'same', weight: to };
}

export function representativeExercisePerformance(
  loggingType: ExerciseLoggingType,
  sets: WorkingSet[],
): ExercisePerformance | null {
  if (loggingType === 'reps') {
    const completed = sets.filter(
      (set): set is WorkingSet & { reps: number } => set.isCompleted && set.reps != null && set.reps >= 1,
    );
    if (completed.length === 0) {
      return null;
    }
    const best = completed.reduce((current, candidate) => {
      if (candidate.reps !== current.reps) {
        return candidate.reps > current.reps ? candidate : current;
      }
      return candidate.sortOrder > current.sortOrder ? candidate : current;
    });
    return { loggingType: 'reps', reps: best.reps };
  }

  if (loggingType === 'duration_weight') {
    const completed = sets.filter(
      (set): set is WorkingSet & { durationSeconds: number } =>
        set.isCompleted && set.durationSeconds != null && set.durationSeconds >= 1,
    );
    if (completed.length === 0) {
      return null;
    }
    const best = completed.reduce((current, candidate) => {
      if (candidate.durationSeconds !== current.durationSeconds) {
        return candidate.durationSeconds > current.durationSeconds ? candidate : current;
      }
      return candidate.sortOrder > current.sortOrder ? candidate : current;
    });
    return {
      loggingType: 'duration_weight',
      durationSeconds: best.durationSeconds,
      weight: best.weight,
    };
  }

  const weighted = representativePerformance(sets);
  if (!weighted) {
    return null;
  }
  return { loggingType: 'weight_reps', weight: weighted.weight, reps: weighted.reps };
}

/** Weight to copy onto a new uncompleted set. Reps and duration stay blank. */
export function rememberedWorkingWeight(loggingType: ExerciseLoggingType, sets: WorkingSet[]): number | null {
  if (loggingType === 'reps') {
    return null;
  }
  if (loggingType === 'duration_weight') {
    const weighted = sets.filter((set) => set.isCompleted && set.weight != null);
    if (weighted.length === 0) {
      return null;
    }
    const best = weighted.reduce((current, candidate) => {
      const currentWeight = roundWeight(current.weight ?? 0);
      const candidateWeight = roundWeight(candidate.weight ?? 0);
      if (candidateWeight !== currentWeight) {
        return candidateWeight > currentWeight ? candidate : current;
      }
      return candidate.sortOrder > current.sortOrder ? candidate : current;
    });
    return best.weight == null ? null : roundWeight(best.weight);
  }
  return representativePerformance(sets)?.weight ?? null;
}
