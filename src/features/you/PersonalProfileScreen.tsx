import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  ageLabel,
  heightFields,
  loadUserProfile,
  savePersonalDetails,
  sexChoices,
} from '@/application/you/profile';
import { sanitizeRepsInput } from '@/application/workout/format';
import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';
import type { SexAtBirth } from '@/domain/models/profile';

export function PersonalProfileScreen() {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState<SexAtBirth | null>(null);
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
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
        const height = heightFields(profile.heightCm);
        setName(profile.displayName ?? '');
        setDateOfBirth(profile.dateOfBirth ?? '');
        setSex(profile.sexAtBirth);
        setFeet(height.feet);
        setInches(height.inches);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setMessage('Your profile could not be loaded.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const today = localDateFromDate(new Date());
  const age = ageLabel(dateOfBirth.trim() === '' ? null : dateOfBirth.trim(), today);

  async function save() {
    if (saving) {
      return;
    }
    setSaving(true);
    try {
      const result = await savePersonalDetails({
        displayName: name,
        dateOfBirth,
        sexAtBirth: sex,
        feet,
        inches,
        today,
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.back();
    } catch {
      setMessage('Your profile could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Personal Profile' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Optional" />
        <TextField
          label="Date of birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
        />
        {age ? (
          <AppText role="small" color="textSecondary">
            {age}
          </AppText>
        ) : null}

        <View style={styles.block}>
          <SectionLabel>Sex assigned at birth</SectionLabel>
          <AppText role="caption" color="textMuted">
            Optional. May help personalize certain fitness calculations in the future.
          </AppText>
          <View style={styles.choices}>
            {sexChoices.map((choice) => (
              <Chip
                key={choice.value}
                label={choice.label}
                selected={choice.value === sex}
                onPress={() => setSex(choice.value === sex ? null : choice.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <SectionLabel>Height</SectionLabel>
          <View style={styles.height}>
            <View style={styles.heightField}>
              <TextField
                label="Feet"
                value={feet}
                onChangeText={(value) => setFeet(sanitizeRepsInput(value).slice(0, 1))}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.heightField}>
              <TextField
                label="Inches"
                value={inches}
                onChangeText={(value) => setInches(sanitizeRepsInput(value).slice(0, 2))}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {message ? (
          <AppText role="small" color="textSecondary">
            {message}
          </AppText>
        ) : null}
        {ready ? <PrimaryButton label="Save" onPress={() => void save()} /> : null}
        <TextAction label="Training preferences" onPress={() => router.push('/you/preferences')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[4],
  },
  block: {
    gap: spacing[2],
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  height: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  heightField: {
    flex: 1,
  },
});
