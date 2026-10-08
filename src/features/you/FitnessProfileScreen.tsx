import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getFitnessProfile, type FitnessProfileView } from '@/application/you/getYou';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';

export function FitnessProfileScreen() {
  const [profile, setProfile] = useState<FitnessProfileView | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getFitnessProfile(localDateFromDate(new Date()))
        .then((next) => {
          if (!cancelled) {
            setProfile(next);
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
      <Stack.Screen options={{ title: 'Fitness Profile' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {failed ? (
          <AppText role="body" color="textSecondary">
            Your fitness profile could not be loaded.
          </AppText>
        ) : null}
        {profile && profile.workoutCount === 0 ? (
          <AppText role="body" color="textSecondary">
            No completed workouts yet.
          </AppText>
        ) : null}
        {profile && profile.workoutCount > 0 ? (
          <>
            <View style={styles.block}>
              <SectionLabel>Training</SectionLabel>
              <AppText role="metric">{profile.workoutCount}</AppText>
              <AppText role="body" color="textSecondary">
                completed workouts
              </AppText>
            </View>
            {profile.mostTrained ? (
              <View style={styles.block}>
                <SectionLabel>Most trained</SectionLabel>
                <AppText role="title3">{profile.mostTrained}</AppText>
              </View>
            ) : null}
            {profile.recent ? (
              <View style={styles.block}>
                <SectionLabel>Recently</SectionLabel>
                <AppText role="body">{profile.recent}</AppText>
              </View>
            ) : null}
            {profile.exercises.length > 0 ? (
              <View style={styles.block}>
                <SectionLabel>Frequently used exercises</SectionLabel>
                {profile.exercises.map((name) => (
                  <AppText key={name} role="body">
                    {name}
                  </AppText>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
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
