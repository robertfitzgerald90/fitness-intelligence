import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { TodayHero } from '@/application/today/todayViewModel';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { spacing } from '@/design/tokens';
import { openTodayRoute } from '@/features/today/openTodayRoute';
import { RecommendationReasoningSheet } from '@/features/today/RecommendationReasoningSheet';

type Props = {
  hero: TodayHero;
};

export function TodayTrainingCard({ hero }: Props) {
  if (hero.kind === 'insufficientHistory') {
    return (
      <Card tone="emphasis">
        <SectionLabel>{"Today's training"}</SectionLabel>
        <AppText role="title1">{hero.title}</AppText>
        <AppText role="body" color="textSecondary">
          {hero.explanation}
        </AppText>
        <PrimaryButton
          label={hero.primaryAction.label}
          onPress={() => openTodayRoute(hero.primaryAction.route)}
        />
      </Card>
    );
  }

  if (hero.kind === 'postWorkout') {
    return <PostWorkoutHero hero={hero} />;
  }

  return <RecommendationHero hero={hero} />;
}

function RecommendationHero({ hero }: { hero: Extract<TodayHero, { kind: 'recommendation' }> }) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const secondaryAction = hero.secondaryAction;

  return (
    <Card tone="emphasis">
      <View style={styles.labelRow}>
        <SectionLabel>{"Today's training"}</SectionLabel>
        <AppText role="caption" color="textSecondary">
          {hero.activityLabel}
        </AppText>
      </View>
      <View style={styles.titleRow}>
        <AppText role="title1" style={styles.title}>
          {hero.title}
        </AppText>
        {hero.durationLabel ? (
          <AppText role="body" color="textSecondary">
            {hero.durationLabel}
          </AppText>
        ) : null}
      </View>
      {hero.contextLine ? (
        <AppText role="body" color="textSecondary">
          {hero.contextLine}
        </AppText>
      ) : null}
      {hero.sessionTitle ? <AppText role="title3">{hero.sessionTitle}</AppText> : null}
      <AppText role="body" color="textSecondary">
        {hero.explanation}
      </AppText>
      <TextAction
        label="Why?"
        accessibilityLabel={hero.reasoningTitle}
        onPress={() => setReasoningOpen(true)}
      />
      <View style={styles.actions}>
        <PrimaryButton
          label={hero.primaryAction.label}
          onPress={() => openTodayRoute(hero.primaryAction.route)}
        />
        {secondaryAction ? (
          <SecondaryButton
            label={secondaryAction.label}
            onPress={() => openTodayRoute(secondaryAction.route)}
          />
        ) : null}
      </View>
      <RecommendationReasoningSheet
        visible={reasoningOpen}
        title={hero.reasoningTitle}
        reasons={hero.reasoning}
        onClose={() => setReasoningOpen(false)}
      />
    </Card>
  );
}

function PostWorkoutHero({ hero }: { hero: Extract<TodayHero, { kind: 'postWorkout' }> }) {
  return (
    <Card tone="emphasis">
      <SectionLabel>Workout complete</SectionLabel>
      <View style={styles.titleRow}>
        <AppText role="title1" style={styles.title}>
          {hero.title}
        </AppText>
        <AppText role="body" color="textSecondary">
          {hero.durationLabel}
        </AppText>
      </View>
      <AppText role="small" color="textSecondary">
        {hero.statsLabel}
      </AppText>
      <AppText role="bodyStrong">{hero.progressedHeadline}</AppText>
      <View style={styles.list}>
        {hero.highlights.map((item) => (
          <View key={item.name} style={styles.listItem}>
            <AppText role="bodyStrong">{item.name}</AppText>
            <AppText role="small" color="textSecondary">
              {item.detail}
            </AppText>
          </View>
        ))}
      </View>
      <AppText role="caption" color="textMuted" style={styles.sinceLabel}>
        Since you started
      </AppText>
      <View style={styles.list}>
        {hero.sinceStarted.map((item) => (
          <View key={item.name} style={styles.sinceRow}>
            <AppText role="body">{item.name}</AppText>
            <AppText role="bodyStrong">{item.change}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.takeaway}>
        <AppText role="caption" color="textMuted">
          {hero.takeawayLabel}
        </AppText>
        <AppText role="body" color="textSecondary" style={styles.takeawayText}>
          {hero.takeaway}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  title: {
    flex: 1,
  },
  actions: {
    gap: spacing[1],
    marginTop: spacing[2],
  },
  list: {
    gap: spacing[3],
  },
  listItem: {
    gap: spacing[1],
  },
  sinceLabel: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sinceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  takeaway: {
    gap: spacing[2],
  },
  takeawayText: {
    fontStyle: 'italic',
  },
});
