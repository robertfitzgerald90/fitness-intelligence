import { StyleSheet, View } from 'react-native';

import type { GoalsModel } from '@/application/today/todayViewModel';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SectionLabel } from '@/components/SectionLabel';
import { colors, spacing } from '@/design/tokens';
import { GoalProgressItem } from '@/features/today/GoalProgressItem';
import { openTodayRoute } from '@/features/today/openTodayRoute';

type Props = {
  model: GoalsModel;
};

export function GoalsCard({ model }: Props) {
  if (model.status === 'empty') {
    return (
      <Card>
        <SectionLabel>Goals</SectionLabel>
        <EmptyState title={model.title} message={model.message} />
      </Card>
    );
  }

  return (
    <Card onPress={() => openTodayRoute(model.route)} accessibilityHint="Opens goals">
      <SectionLabel>Goals</SectionLabel>
      <View style={styles.list}>
        {model.goals.map((goal, index) => (
          <View key={goal.id} style={styles.goal}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <GoalProgressItem goal={goal} />
          </View>
        ))}
      </View>
      <AppText role="bodyStrong" color="primary">
        {model.actionLabel} →
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[4],
  },
  goal: {
    gap: spacing[4],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
