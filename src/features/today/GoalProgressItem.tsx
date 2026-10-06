import { StyleSheet, View } from 'react-native';

import type { GoalItemModel } from '@/application/today/todayViewModel';
import { AppText } from '@/components/AppText';
import { ProgressBar } from '@/components/ProgressBar';
import { spacing } from '@/design/tokens';

type Props = {
  goal: GoalItemModel;
};

export function GoalProgressItem({ goal }: Props) {
  return (
    <View style={styles.item}>
      <AppText role="bodyStrong">{goal.title}</AppText>
      <AppText role="small" color="textSecondary">
        {goal.metricLabel}
      </AppText>
      <AppText role="title3">{goal.valueLabel}</AppText>
      {goal.targetLabel ? (
        <AppText role="small" color="textMuted">
          {goal.targetLabel}
        </AppText>
      ) : null}
      {goal.progress !== null ? (
        <ProgressBar progress={goal.progress} accessibilityLabel={goal.progressLabel} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing[1],
  },
});
