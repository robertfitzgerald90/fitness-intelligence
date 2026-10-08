import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radius, spacing } from '@/design/tokens';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onEndEditing?: () => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function TextField({
  label,
  value,
  onChangeText,
  onEndEditing,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'words',
}: Props) {
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
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
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
