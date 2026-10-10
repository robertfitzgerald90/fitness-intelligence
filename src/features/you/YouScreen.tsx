import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getYouHome, type YouHome, type YouSnapshot } from '@/application/you/getYou';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';

const EMPTY = {
  body: 'Log your first measurement to start tracking body changes.',
  vitals: 'Log a reading to start building your history.',
  goals: "Set a goal when there's something you want to work toward.",
  profile: 'No completed workouts yet.',
} as const;

export function YouScreen() {
  const [home, setHome] = useState<YouHome | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getYouHome(localDateFromDate(new Date()))
        .then((next) => {
          if (!cancelled) {
            setHome(next);
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
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppText role="title1">You</AppText>
        {failed ? (
          <AppText role="body" color="textSecondary">
            Your profile could not be loaded.
          </AppText>
        ) : null}

        {home ? (
          <>
            <View style={styles.section}>
              <SectionLabel>My profile</SectionLabel>
              {home.personal.name ? <AppText role="title3">{home.personal.name}</AppText> : null}
              {home.personal.context ? (
                <AppText role="body" color="textSecondary">
                  {home.personal.context}
                </AppText>
              ) : null}
              {!home.personal.name && !home.personal.context ? (
                <AppText role="body" color="textSecondary">
                  Add your name and how you like to train.
                </AppText>
              ) : null}
              <Pressable accessibilityRole="button" onPress={() => router.push('/you/personal')} style={styles.link}>
                <AppText role="bodyStrong" color="primary">
                  Edit Profile →
                </AppText>
              </Pressable>
            </View>
            {home.suggestions.length > 0 ? (
              <View style={styles.section}>
                <SectionLabel>Complete your profile</SectionLabel>
                {home.suggestions.map((suggestion) => (
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
            <SnapshotSection
              label="Body"
              snapshot={home.body}
              empty={EMPTY.body}
              action="View Body"
              onPress={() => router.push('/you/body')}
            />
            <SnapshotSection
              label="Vitals"
              snapshot={home.vitals}
              empty={EMPTY.vitals}
              action="View Vitals"
              onPress={() => router.push('/you/vitals')}
            />
            <ListSection
              label="Goals"
              lines={home.goals}
              empty={EMPTY.goals}
              action="View Goals"
              onPress={() => router.push('/you/goals')}
            />
            <ListSection
              label="Fitness Profile"
              lines={home.profile}
              empty={EMPTY.profile}
              action="View Fitness Profile"
              onPress={() => router.push('/you/profile')}
            />
          </>
        ) : null}

        <View style={styles.section}>
          <SectionLabel>Settings & data</SectionLabel>
          <SettingsRow label="Units" onPress={() => router.push('/you/settings')} />
          <SettingsRow label="Data & Privacy" onPress={() => router.push('/you/settings')} />
          <SettingsRow label="About Fitness Intelligence" onPress={() => router.push('/you/settings')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function SnapshotSection({
  label,
  snapshot,
  empty,
  action,
  onPress,
}: {
  label: string;
  snapshot: YouSnapshot | null;
  empty: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.section}>
      <SectionLabel>{label}</SectionLabel>
      {snapshot ? (
        <>
          <AppText role="metric">{snapshot.value}</AppText>
          <AppText role="body" color="textSecondary">
            {snapshot.context}
          </AppText>
          {snapshot.extra ? (
            <AppText role="body" color="textSecondary">
              {snapshot.extra}
            </AppText>
          ) : null}
        </>
      ) : (
        <AppText role="body" color="textSecondary">
          {empty}
        </AppText>
      )}
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.link}>
        <AppText role="bodyStrong" color="primary">
          {action} →
        </AppText>
      </Pressable>
    </View>
  );
}

function ListSection({
  label,
  lines,
  empty,
  action,
  onPress,
}: {
  label: string;
  lines: string[];
  empty: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.section}>
      <SectionLabel>{label}</SectionLabel>
      {lines.length === 0 ? (
        <AppText role="body" color="textSecondary">
          {empty}
        </AppText>
      ) : (
        lines.map((line, index) => (
          <AppText key={`${index}-${line}`} role="body">
            {line}
          </AppText>
        ))
      )}
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.link}>
        <AppText role="bodyStrong" color="primary">
          {action} →
        </AppText>
      </Pressable>
    </View>
  );
}

function SettingsRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <AppText role="body">{label}</AppText>
      <AppText role="body" color="textMuted">
        →
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[6],
  },
  section: {
    gap: spacing[2],
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.75,
  },
});
