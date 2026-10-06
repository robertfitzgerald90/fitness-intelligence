import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';

type Props = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function TextAction({ label, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}
    >
      <AppText role="bodyStrong" color="primary">
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
  },
  pressed: {
    opacity: 0.7,
  },
});
