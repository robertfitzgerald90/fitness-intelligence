import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getBody, type BodyView } from '@/application/you/getYou';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';
import { CompactTrendChart } from '@/features/today/CompactTrendChart';
import { HistoryRows } from '@/features/you/HistoryRows';

export function BodyScreen() {
  const [view, setView] = useState<BodyView | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getBody(localDateFromDate(new Date()))
        .then((next) => {
          if (!cancelled) {
            setView(next);
            setFailed(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFailed(true);
          }
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Body' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {failed ? (
          <AppText role="body" color="textSecondary">
            Body measurements could not be loaded.
          </AppText>
        ) : null}

        {view && !view.current ? (
          <AppText role="body" color="textSecondary">
            Log your first measurement to start tracking body changes.
          </AppText>
        ) : null}
        {view?.current ? (
          <>
            <View style={styles.block}>
              <SectionLabel>Current weight</SectionLabel>
              <AppText role="metricLarge">{view.current}</AppText>
              {view.change ? (
                <AppText role="body" color="textSecondary">
                  {view.change}
                </AppText>
              ) : null}
              <CompactTrendChart points={view.weightPoints} accessibilityLabel="Weight over time" />
            </View>
            {view.bodyFat ? (
              <View style={styles.block}>
                <SectionLabel>Body fat</SectionLabel>
                <AppText role="metric">{view.bodyFat.current}</AppText>
                <CompactTrendChart points={view.bodyFat.points} accessibilityLabel="Body fat over time" height={64} />
                <HistoryRows rows={view.bodyFat.history} onPress={openEntry} />
              </View>
            ) : null}
            <View style={styles.block}>
              <SectionLabel>History</SectionLabel>
              <HistoryRows rows={view.history} onPress={openEntry} />
            </View>
          </>
        ) : null}
        <PrimaryButton label="Log weight" onPress={() => router.push('/you/body/entry')} />
      </ScrollView>
    </Screen>
  );
}

function openEntry(id: string) {
  router.push({ pathname: '/you/body/entry', params: { id } });
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  block: {
    gap: spacing[2],
  },
});
