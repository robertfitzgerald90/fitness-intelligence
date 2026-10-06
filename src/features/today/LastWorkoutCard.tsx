import { StyleSheet, View } from 'react-native';

import type { LastWorkoutModel } from '@/application/today/todayViewModel';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SectionLabel } from '@/components/SectionLabel';
import { TrendIndicator } from '@/components/TrendIndicator';
import { spacing } from '@/design/tokens';
import { openTodayRoute } from '@/features/today/openTodayRoute';

type Props = {
  model: LastWorkoutModel;
};

export function LastWorkoutCard({ model }: Props) {
  if (model.status === 'empty') {
    return (
      <Card>
        <SectionLabel>Last workout</SectionLabel>
        <EmptyState title={model.title} message={model.message} />
      </Card>
    );
  }

  return (
    <Card
      onPress={() => openTodayRoute(model.route)}
      accessibilityHint="Opens this workout"
    >
      <SectionLabel>Last workout</SectionLabel>
      <AppText role="title2">{model.title}</AppText>
      <AppText role="small" color="textSecondary">
        {model.dateLabel} · {model.durationLabel}
      </AppText>
      <AppText role="small" color="textMuted">
        {model.summaryLabel}
      </AppText>
      <View style={styles.highlights}>
        {model.highlights.map((highlight) => (
          <View key={highlight.name} style={styles.highlight}>
            <AppText role="bodyStrong">{highlight.name}</AppText>
            <AppText role="small" color="textSecondary">
              {highlight.performance}
            </AppText>
          </View>
        ))}
      </View>
      {model.progressionLabel ? <TrendIndicator label={model.progressionLabel} /> : null}
      <AppText role="bodyStrong" color="primary">
        {model.actionLabel} →
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  highlights: {
    gap: spacing[3],
    marginTop: spacing[1],
  },
  highlight: {
    gap: spacing[1],
  },
});
