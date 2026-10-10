import { router, Stack } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  activityChoices,
  durationChoices,
  experienceChoices,
  loadUserProfile,
  locationChoices,
  objectiveChoices,
  saveTrainingPreferences,
} from '@/application/you/profile';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { colors, radius, spacing } from '@/design/tokens';
import type {
  ExperienceLevel,
  PreferredActivity,
  PreferredWorkoutMinutes,
  PrimaryObjective,
  TrainingLocation,
} from '@/domain/models/profile';

const WEEK_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

export function TrainingPreferencesScreen() {
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [objective, setObjective] = useState<PrimaryObjective | null>(null);
  const [location, setLocation] = useState<TrainingLocation | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<PreferredWorkoutMinutes | null>(null);
  const [activities, setActivities] = useState<PreferredActivity[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadUserProfile()
      .then((profile) => {
        if (cancelled) {
          return;
        }
        setExperience(profile.experienceLevel);
        setObjective(profile.primaryObjective);
        setLocation(profile.trainingLocation);
        setDays(profile.preferredWorkoutsPerWeek);
        setMinutes(profile.preferredWorkoutMinutes);
        setActivities(profile.preferredActivities);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setMessage('Training preferences could not be loaded.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleActivity(activity: PreferredActivity) {
    setActivities((current) =>
      current.includes(activity) ? current.filter((item) => item !== activity) : [...current, activity],
    );
  }

  async function save() {
    if (saving) {
      return;
    }
    setSaving(true);
    try {
      const result = await saveTrainingPreferences({
        experienceLevel: experience,
        primaryObjective: objective,
        trainingLocation: location,
        workoutsPerWeek: days,
        workoutMinutes: minutes,
        activities,
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.back();
    } catch {
      setMessage('Training preferences could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Training Preferences' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.block}>
          <SectionLabel>Experience level</SectionLabel>
          {experienceChoices.map((choice) => (
            <Pressable
              key={choice.value}
              accessibilityRole="button"
              accessibilityState={{ selected: choice.value === experience }}
              onPress={() => setExperience(choice.value === experience ? null : choice.value)}
              style={({ pressed }) => [
                styles.experience,
                choice.value === experience && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <AppText role="bodyStrong">{choice.label}</AppText>
              <AppText role="small" color="textSecondary">
                {choice.description}
              </AppText>
            </Pressable>
          ))}
        </View>

        <ChoiceGroup label="Primary objective">
          {objectiveChoices.map((choice) => (
            <Chip
              key={choice.value}
              label={choice.label}
              selected={choice.value === objective}
              onPress={() => setObjective(choice.value === objective ? null : choice.value)}
            />
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="Training location">
          {locationChoices.map((choice) => (
            <Chip
              key={choice.value}
              label={choice.label}
              selected={choice.value === location}
              onPress={() => setLocation(choice.value === location ? null : choice.value)}
            />
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="Preferred training frequency">
          {WEEK_OPTIONS.map((option) => (
            <Chip
              key={option}
              label={`${option} days`}
              selected={option === days}
              onPress={() => setDays(option === days ? null : option)}
            />
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="Preferred workout duration">
          {durationChoices.map((option) => (
            <Chip
              key={option}
              label={`${option} minutes`}
              selected={option === minutes}
              onPress={() => setMinutes(option === minutes ? null : option)}
            />
          ))}
        </ChoiceGroup>

        <ChoiceGroup label="Preferred activities">
          {activityChoices.map((choice) => (
            <Chip
              key={choice.value}
              label={choice.label}
              selected={activities.includes(choice.value)}
              onPress={() => toggleActivity(choice.value)}
            />
          ))}
        </ChoiceGroup>

        {message ? (
          <AppText role="small" color="textSecondary">
            {message}
          </AppText>
        ) : null}
        {ready ? <PrimaryButton label="Save" onPress={() => void save()} /> : null}
        <TextAction label="Personal profile" onPress={() => router.push('/you/personal')} />
      </ScrollView>
    </Screen>
  );
}

function ChoiceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.block}>
      <SectionLabel>{label}</SectionLabel>
      <View style={styles.choices}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  block: {
    gap: spacing[2],
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  experience: {
    gap: spacing[1],
    padding: spacing[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  selected: {
    backgroundColor: colors.primarySubtle,
  },
  pressed: {
    opacity: 0.8,
  },
});
