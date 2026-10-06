import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/design/tokens';

type Props = {
  progress: number;
  accessibilityLabel: string;
};

export function ProgressBar({ progress, accessibilityLabel }: Props) {
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSubtle,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.strength,
  },
});
