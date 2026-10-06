export type Goal = {
  id: string;
  title: string;
  metricLabel: string;
  unit: 'lb' | 'seconds';
  direction: 'increase' | 'decrease';
  currentValue: number;
  targetValue: number;
  startValue?: number;
};
