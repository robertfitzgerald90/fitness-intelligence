type GoalSpan = {
  direction: 'increase' | 'decrease';
  startValue?: number;
  currentValue: number;
  targetValue: number;
};

export function goalProgressRatio(goal: GoalSpan): number | null {
  if (goal.startValue === undefined) {
    return null;
  }

  if (goal.direction === 'increase') {
    const span = goal.targetValue - goal.startValue;
    if (span <= 0) {
      return null;
    }
    return clamp((goal.currentValue - goal.startValue) / span);
  }

  const span = goal.startValue - goal.targetValue;
  if (span <= 0) {
    return null;
  }
  return clamp((goal.startValue - goal.currentValue) / span);
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}
