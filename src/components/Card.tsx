import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/design/tokens';

type Props = {
  children: ReactNode;
  tone?: 'default' | 'emphasis';
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function Card({ children, tone = 'default', onPress, accessibilityLabel, accessibilityHint }: Props) {
  const card = <View style={[styles.card, tone === 'emphasis' && styles.emphasis]}>{children}</View>;

  if (!onPress) {
    return card;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing[5],
    gap: spacing[3],
  },
  emphasis: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing[5],
  },
  pressed: {
    opacity: 0.92,
  },
});
