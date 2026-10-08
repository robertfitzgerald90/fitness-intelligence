import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { deleteBloodPressure, loadVitalEntry, saveBloodPressure, vitalEntryDate } from '@/application/you/getYou';
import { sanitizeRepsInput } from '@/application/workout/format';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { TextAction } from '@/components/TextAction';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import { localDateFromDate } from '@/domain/calendar/dates';

type Props = {
  entryId: string | null;
};

export function VitalEntryScreen({ entryId }: Props) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [date, setDate] = useState(() => vitalEntryDate(null, localDateFromDate(new Date())));
  const [existingRecordedAt, setExistingRecordedAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!entryId) {
      return;
    }
    let cancelled = false;
    loadVitalEntry(entryId)
      .then((entry) => {
        if (cancelled) {
          return;
        }
        if (!entry) {
          setMissing(true);
          return;
        }
        setSystolic(String(entry.systolic));
        setDiastolic(String(entry.diastolic));
        setPulse(entry.pulse == null ? '' : String(entry.pulse));
        setDate(vitalEntryDate(entry, localDateFromDate(new Date())));
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
      const result = await saveBloodPressure({
        id: entryId,
        systolicText: systolic,
        diastolicText: diastolic,
        pulseText: pulse,
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
      setMessage('This reading could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    if (!entryId) {
      return;
    }
    Alert.alert('Delete this reading?', 'It will be removed from your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBloodPressure(entryId)
            .then(() => router.back())
            .catch(() => setMessage('This reading could not be deleted.'));
        },
      },
    ]);
  }

  if (missing) {
    return (
      <Screen edges={['left', 'right', 'bottom']}>
        <Stack.Screen options={{ title: 'Blood pressure' }} />
        <AppText role="body" color="textSecondary" style={styles.missing}>
          This reading is not available.
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: entryId ? 'Edit blood pressure' : 'Log blood pressure' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label="Systolic"
          value={systolic}
          onChangeText={(value) => setSystolic(sanitizeRepsInput(value))}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <TextField
          label="Diastolic"
          value={diastolic}
          onChangeText={(value) => setDiastolic(sanitizeRepsInput(value))}
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <TextField
          label="Pulse (bpm)"
          value={pulse}
          onChangeText={(value) => setPulse(sanitizeRepsInput(value))}
          placeholder="Optional"
          keyboardType="number-pad"
          autoCapitalize="none"
        />
        <TextField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
        {message ? (
          <AppText role="small" color="textSecondary">
            {message}
          </AppText>
        ) : null}
        <PrimaryButton label="Save" onPress={() => void save()} />
        {entryId ? (
          <View style={styles.delete}>
            <TextAction label="Delete reading" onPress={confirmDelete} tone="muted" />
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
