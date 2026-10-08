import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { spacing } from '@/design/tokens';
import type { HistoryRow } from '@/application/you/getYou';

type Props = {
  rows: HistoryRow[];
  onPress: (id: string) => void;
};

export function HistoryRows({ rows, onPress }: Props) {
  return (
    <View>
      {rows.map((row) => (
        <Pressable
          key={row.id}
          accessibilityRole="button"
          accessibilityLabel={`${row.day}, ${row.detail}`}
          onPress={() => onPress(row.id)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <AppText role="body" color="textSecondary">
            {row.day}
          </AppText>
          <AppText role="bodyStrong">{row.detail}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  pressed: {
    opacity: 0.75,
  },
});
