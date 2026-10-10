import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

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

        {profile && profile.suggestions.length > 0 ? (
          <View style={styles.block}>
            <SectionLabel>Complete your profile</SectionLabel>
            {profile.suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.id}
                accessibilityRole="button"
                onPress={() => router.push(suggestion.route)}
                style={styles.link}
              >
                <AppText role="body" color="textSecondary">
                  {suggestion.label} →
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        {profile ? (
          <View style={styles.block}>
            <SectionLabel>My preferences</SectionLabel>
            {profile.preferences.length === 0 ? (
              <AppText role="body" color="textSecondary">
                Preferences you save will show up here.
              </AppText>
            ) : (
              profile.preferences.map((line) => (
                <View key={line.label} style={styles.line}>
                  <AppText role="caption" color="textMuted">
                    {line.label}
                  </AppText>
                  <AppText role="body">{line.value}</AppText>
                </View>
              ))
            )}
            <Pressable accessibilityRole="button" onPress={() => router.push('/you/preferences')} style={styles.link}>
              <AppText role="bodyStrong" color="primary">
                Edit preferences →
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {profile ? (
          <View style={styles.block}>
            <SectionLabel>My training patterns</SectionLabel>
            {profile.workoutCount === 0 ? (
              <AppText role="body" color="textSecondary">
                No completed workouts yet.
              </AppText>
            ) : (
              <>
                <AppText role="body" color="textSecondary">
                  {profile.workoutCount} completed workouts
                </AppText>
                {profile.averageWorkouts ? (
                  <Pattern label="Average workouts" value={profile.averageWorkouts} />
                ) : null}
                {profile.averageDuration ? (
                  <Pattern label="Average duration" value={profile.averageDuration} />
                ) : null}
                {profile.mostTrained ? (
                  <Pattern label="Most frequently performed workout" value={profile.mostTrained} />
                ) : null}
                {profile.recent ? (
                  <AppText role="small" color="textMuted">
                    {profile.recent}
                  </AppText>
                ) : null}
                {profile.exercises.length > 0 ? (
                  <View style={styles.line}>
                    <AppText role="caption" color="textMuted">
                      Frequently used exercises
                    </AppText>
                    {profile.exercises.map((name) => (
                      <AppText key={name} role="body">
                        {name}
                      </AppText>
                    ))}
                  </View>
                ) : null}
              </>
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Pattern({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <AppText role="caption" color="textMuted">
        {label}
      </AppText>
      <AppText role="body">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  block: {
    gap: spacing[3],
  },
  line: {
    gap: spacing[1],
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
