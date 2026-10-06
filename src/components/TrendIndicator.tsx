import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, spacing } from '@/design/tokens';

type Props = {
  label: string;
};

export function TrendIndicator({ label }: Props) {
  return (
    <View style={styles.row} accessibilityLabel={label}>
      <Ionicons name="arrow-up" size={14} color={colors.positive} />
      <AppText role="small" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
});
