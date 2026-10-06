import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { radius } from '@/design/tokens';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function SecondaryButton({ label, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <AppText role="bodyStrong" color="textSecondary">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
