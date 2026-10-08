import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { bodyEntryDate, deleteBodyMeasurement, loadBodyEntry, saveBodyMeasurement } from '@/application/you/getYou';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextAction } from '@/components/TextAction';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';
import { sanitizeWeightInput, weightToInput } from '@/application/workout/format';

type Props = {
  entryId: string | null;
};

export function BodyEntryScreen({ entryId }: Props) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [date, setDate] = useState(() => bodyEntryDate(null, localDateFromDate(new Date())));
  const [existingRecordedAt, setExistingRecordedAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!entryId) {
      return;
    }
    let cancelled = false;
    loadBodyEntry(entryId)
      .then((entry) => {
        if (cancelled) {
          return;
        }
        if (!entry) {
          setMissing(true);
          return;
        }
        const today = localDateFromDate(new Date());
        setWeight(weightToInput(entry.weight));
        setBodyFat(entry.bodyFatPercent == null ? '' : weightToInput(entry.bodyFatPercent));
        setDate(bodyEntryDate(entry, today));
        setExistingRecordedAt(entry.recordedAt);
      })
      .catch(() => {
        if (!cancelled) {
          setMissing(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  async function save() {
    if (saving) {
      return;
    }
    setSaving(true);
    try {
      const result = await saveBodyMeasurement({
        id: entryId,
        weightText: weight,
        bodyFatText: bodyFat,
        dateText: date,
        existingRecordedAt,
        now: new Date(),
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.back();
    } catch {
      setMessage('This measurement could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!entryId) {
      return;
    }
    Alert.alert('Delete this measurement?', 'It will be removed from your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBodyMeasurement(entryId)
            .then(() => router.back())
            .catch(() => setMessage('This measurement could not be deleted.'));
        },
      },
    ]);
  }

  if (missing) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ title: 'Weight' }} />
        <AppText role="body" color="textSecondary" style={styles.missing}>
          This measurement is not available.
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: entryId ? 'Edit weight' : 'Log weight' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Weight (lb)"
          value={weight}
          onChangeText={(value) => setWeight(sanitizeWeightInput(value))}
          keyboardType="decimal-pad"
          autoCapitalize="none"
        />
        <TextField
          label="Body fat (%)"
          value={bodyFat}
          onChangeText={(value) => setBodyFat(sanitizeWeightInput(value))}
          placeholder="Optional"
          keyboardType="decimal-pad"
          autoCapitalize="none"
        />
        <TextField
          label="Date"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
        />
        {message ? (
          <AppText role="small" color="textSecondary">
            {message}
          </AppText>
        ) : null}
        <PrimaryButton label="Save" onPress={() => void save()} />
        {entryId ? (
          <View style={styles.delete}>
            <TextAction label="Delete measurement" onPress={confirmDelete} tone="muted" />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  missing: {
    paddingTop: spacing[4],
  },
  delete: {
    alignItems: 'flex-start',
  },
});
