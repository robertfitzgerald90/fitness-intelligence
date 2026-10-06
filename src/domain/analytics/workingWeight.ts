export type WorkingSet = {
  weight: number | null;
  reps: number | null;
  isCompleted: boolean;
  sortOrder: number;
};

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
