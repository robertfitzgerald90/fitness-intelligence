type WeightedPoint = {
  weightLb: number;
};

export type StrengthChange = {
  deltaLb: number;
  headline: string;
};

export function strengthChange(points: WeightedPoint[]): StrengthChange | null {
  if (points.length < 2) {
    return null;
  }

  const first = points[0]?.weightLb;
  const last = points[points.length - 1]?.weightLb;
  if (first === undefined || last === undefined) {
    return null;
  }

  const deltaLb = last - first;
  if (deltaLb > 0) {
    return { deltaLb, headline: `+${deltaLb} lb since you started` };
  }
  if (deltaLb < 0) {
    return {
      deltaLb,
      headline: `${Math.abs(deltaLb)} lb below where you started`,
    };
  }
  return { deltaLb: 0, headline: 'Holding steady since you started' };
}
