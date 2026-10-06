import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import type { ColorName } from '@/design/tokens';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  tone?: 'primary' | 'muted';
};

export function TextAction({ label, onPress, accessibilityLabel, tone = 'primary' }: Props) {
  const color: ColorName = tone === 'muted' ? 'textMuted' : 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <AppText role="bodyStrong" color={color}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingRight: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
