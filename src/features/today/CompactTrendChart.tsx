import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/design/tokens';

type Props = {
  points: number[];
  accessibilityLabel: string;
  height?: number;
};

const DEFAULT_HEIGHT = 84;

export function CompactTrendChart({ points, accessibilityLabel, height = DEFAULT_HEIGHT }: Props) {
  const [width, setWidth] = useState(0);

  if (points.length < 2) {
    return null;
  }

  const coordinates = width > 0 ? layoutPoints(points, width, height) : [];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[styles.chart, { height }]}
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        if (nextWidth !== width) {
          setWidth(nextWidth);
        }
      }}
    >
      {coordinates.slice(1).map((point, index) => {
        const previous = coordinates[index];
        if (!previous) {
          return null;
        }
        return <Segment key={`${previous.x}-${point.x}`} from={previous} to={point} />;
      })}
      {coordinates.map((point, index) => {
        const isLatest = index === coordinates.length - 1;
        return (
          <View key={`${point.x}-${point.y}`}>
            {isLatest ? <View style={[styles.halo, dotPosition(point, 18)]} /> : null}
            <View style={[isLatest ? styles.latestDot : styles.dot, dotPosition(point, isLatest ? 8 : 5)]} />
          </View>
        );
      })}
    </View>
  );
}

type Coordinate = {
  x: number;
  y: number;
};

function layoutPoints(values: number[], width: number, height: number): Coordinate[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const delta = max - min;
  const headroom = delta === 0 ? 1 : delta * 0.18;
  const low = min - headroom;
  const high = max + headroom;
  const padX = 10;
  const padY = 12;
  const innerWidth = Math.max(width - padX * 2, 1);
  const innerHeight = Math.max(height - padY * 2, 1);

  return values.map((value, index) => ({
    x: padX + (index / (values.length - 1)) * innerWidth,
    y: padY + (1 - (value - low) / (high - low)) * innerHeight,
  }));
}

function Segment({ from, to }: { from: Coordinate; to: Coordinate }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`;

  return (
    <View
      style={{
        position: 'absolute',
        left: (from.x + to.x) / 2 - length / 2,
        top: (from.y + to.y) / 2 - 1,
        width: length,
        height: 2,
        borderRadius: 1,
        backgroundColor: colors.strength,
        transform: [{ rotate: angle }],
      }}
    />
  );
}

function dotPosition(point: Coordinate, size: number) {
  return {
    left: point.x - size / 2,
    top: point.y - size / 2,
    width: size,
    height: size,
    borderRadius: size / 2,
  };
}

const styles = StyleSheet.create({
  chart: {
    height: DEFAULT_HEIGHT,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.strength,
    opacity: 0.55,
  },
  latestDot: {
    position: 'absolute',
    backgroundColor: colors.strength,
  },
  halo: {
    position: 'absolute',
    backgroundColor: colors.strength,
    opacity: 0.18,
  },
});
