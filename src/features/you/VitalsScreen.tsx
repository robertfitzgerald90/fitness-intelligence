import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MEDICAL_REFERENCE } from '@/application/you/format';
import { getVitals, type VitalView } from '@/application/you/getYou';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';
import { CompactTrendChart } from '@/features/today/CompactTrendChart';
import { HistoryRows } from '@/features/you/HistoryRows';

export function VitalsScreen() {
  const [view, setView] = useState<VitalView | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getVitals(localDateFromDate(new Date()))
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
      <Stack.Screen options={{ title: 'Vitals' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {failed ? (
          <AppText role="body" color="textSecondary">
            Vitals could not be loaded.
          </AppText>
        ) : null}

        {view && !view.current ? (
          <AppText role="body" color="textSecondary">
            Log a reading to start building your history.
          </AppText>
        ) : null}
        {view?.current ? (
          <>
            <View style={styles.block}>
              <SectionLabel>Blood pressure</SectionLabel>
              <AppText role="metricLarge">{view.current}</AppText>
              {view.pulse ? <AppText role="title3">{view.pulse}</AppText> : null}
              {view.when ? (
                <AppText role="body" color="textSecondary">
                  {view.when}
                </AppText>
              ) : null}
            </View>
            <View style={styles.block}>
              <SectionLabel>Systolic</SectionLabel>
              <CompactTrendChart points={view.systolicPoints} accessibilityLabel="Systolic over time" height={64} />
              <SectionLabel>Diastolic</SectionLabel>
              <CompactTrendChart points={view.diastolicPoints} accessibilityLabel="Diastolic over time" height={64} />
            </View>
            <View style={styles.block}>
              <SectionLabel>History</SectionLabel>
              <HistoryRows rows={view.history} onPress={openEntry} />
            </View>
          </>
        ) : null}
        <PrimaryButton label="Log blood pressure" onPress={() => router.push('/you/vitals/entry')} />
        <AppText role="caption" color="textMuted">
          {MEDICAL_REFERENCE}
        </AppText>
      </ScrollView>
    </Screen>
  );
}

function openEntry(id: string) {
  router.push({ pathname: '/you/vitals/entry', params: { id } });
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
