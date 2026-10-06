import type { ScenarioId } from '@/data/seed/scenario';

type SeedPoint = {
  daysAgo: number;
  weightLb: number;
  reps: number;
};

export type SeedHistory = {
  id: string;
  exerciseName: string;
  category: 'strength';
  points: SeedPoint[];
};

function series(
  id: string,
  exerciseName: string,
  lastDaysAgo: number,
  points: { gap: number; weightLb: number; reps: number }[],
): SeedHistory {
  return {
    id,
    exerciseName,
    category: 'strength',
    points: points.map((point) => ({
      daysAgo: lastDaysAgo + point.gap,
      weightLb: point.weightLb,
      reps: point.reps,
    })),
  };
}

function historiesEnding(lastDaysAgo: number): SeedHistory[] {
  return [
    series('history-bench', 'Machine Bench Press', lastDaysAgo, [
      { gap: 68, weightLb: 75, reps: 12 },
      { gap: 54, weightLb: 80, reps: 12 },
      { gap: 40, weightLb: 90, reps: 12 },
      { gap: 26, weightLb: 100, reps: 10 },
      { gap: 12, weightLb: 100, reps: 12 },
      { gap: 0, weightLb: 110, reps: 10 },
    ]),
    series('history-lat-pulldown', 'Lat Pulldown', lastDaysAgo, [
      { gap: 66, weightLb: 75, reps: 12 },
      { gap: 45, weightLb: 85, reps: 12 },
      { gap: 24, weightLb: 90, reps: 10 },
      { gap: 0, weightLb: 100, reps: 10 },
    ]),
    series('history-cable-row', 'Cable Row', lastDaysAgo, [
      { gap: 66, weightLb: 55, reps: 12 },
      { gap: 45, weightLb: 60, reps: 12 },
      { gap: 17, weightLb: 70, reps: 10 },
      { gap: 0, weightLb: 75, reps: 10 },
    ]),
  ];
}

export function seedHistories(scenario: ScenarioId): SeedHistory[] {
  switch (scenario) {
    case 'new':
      return [];
    case 'lapsed':
      return historiesEnding(8);
    case 'postWorkout':
      return historiesEnding(0);
    case 'returning':
      return historiesEnding(4);
    default: {
      const exhaustive: never = scenario;
      return exhaustive;
    }
  }
}

export const highlightedHistoryId = 'history-bench';
