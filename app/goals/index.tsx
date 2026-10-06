import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { getGoalsPreview } from '@/application/today/getTodayDashboard';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { spacing } from '@/design/tokens';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<{ title: string; detail: string }[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getGoalsPreview()
      .then((next) => {
        if (!cancelled) {
          setGoals(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGoals([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Goals' }} />
      <Screen edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        {goals === null ? (
          <AppText role="body" color="textSecondary">
            Opening goals.
          </AppText>
        ) : goals.length > 0 ? (
          goals.map((goal) => (
            <View key={goal.title} style={styles.goal}>
              <AppText role="title3">{goal.title}</AppText>
              <AppText role="body" color="textSecondary">
                {goal.detail}
              </AppText>
            </View>
          ))
        ) : (
          <AppText role="body" color="textSecondary">
            Goals will show up here once you choose what you are working toward.
          </AppText>
        )}
        <AppText role="small" color="textMuted">
          Goal details come in a later update.
        </AppText>
      </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    gap: spacing[5],
  },
  goal: {
    gap: spacing[1],
  },
});
