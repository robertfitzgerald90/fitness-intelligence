import type { ScenarioId } from '@/data/seed/scenario';
import type { Goal } from '@/domain/models/goal';

const activeGoals: Goal[] = [
  {
    id: 'goal-bench',
    title: 'Build Strength',
    metricLabel: 'Machine Bench Press',
    unit: 'lb',
    direction: 'increase',
    startValue: 75,
    currentValue: 110,
    targetValue: 135,
  },
  {
    id: 'goal-5k',
    title: '5K under 30:00',
    metricLabel: '5K',
    unit: 'seconds',
    direction: 'decrease',
    currentValue: 31 * 60 + 42,
    targetValue: 30 * 60,
  },
];

export function seedGoals(scenario: ScenarioId): Goal[] {
  if (scenario === 'new') {
    return [];
  }
  return activeGoals;
}
