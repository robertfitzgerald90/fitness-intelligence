import type { ProgressModel } from '@/application/today/todayViewModel';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SectionLabel } from '@/components/SectionLabel';
import { CompactTrendChart } from '@/features/today/CompactTrendChart';
import { openTodayRoute } from '@/features/today/openTodayRoute';

type Props = {
  model: ProgressModel;
};

export function ProgressCard({ model }: Props) {
  if (model.status === 'empty') {
    return (
      <Card>
        <SectionLabel>Your progress</SectionLabel>
        <EmptyState title={model.title} message={model.message} />
      </Card>
    );
  }

  return (
    <Card onPress={() => openTodayRoute(model.route)} accessibilityHint="Opens strength progress">
      <SectionLabel>Your progress</SectionLabel>
      <AppText role="title3">{model.exerciseName}</AppText>
      <AppText role="metric">{model.headline}</AppText>
      <CompactTrendChart points={model.points} accessibilityLabel={model.accessibilityLabel} />
      <AppText role="body" color="textSecondary">
        {model.supportingText}
      </AppText>
      <AppText role="bodyStrong" color="primary">
        {model.actionLabel} →
      </AppText>
    </Card>
  );
}
