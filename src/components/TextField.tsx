import { StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius, spacing } from '@/design/tokens';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onEndEditing?: () => void;
  placeholder?: string;
};

export function TextField({ label, value, onChangeText, onEndEditing, placeholder }: Props) {
  return (
    <View style={styles.field}>
      <AppText role="caption" color="textMuted">
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onEndEditing={onEndEditing}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        autoCapitalize="words"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing[2],
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing[4],
  },
});
