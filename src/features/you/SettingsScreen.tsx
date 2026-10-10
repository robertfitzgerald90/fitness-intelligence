import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MEDICAL_REFERENCE } from '@/application/you/format';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/design/tokens';

export function SettingsScreen() {
  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Settings & data' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.block}>
          <SectionLabel>Units</SectionLabel>
          <AppText role="body">Weight is recorded in pounds.</AppText>
        </View>
        <View style={styles.block}>
          <SectionLabel>Data & privacy</SectionLabel>
          <AppText role="body" color="textSecondary">
            Your profile, workouts, measurements, and goals stay on this device.
          </AppText>
        </View>
        <View style={styles.block}>
          <SectionLabel>About Fitness Intelligence</SectionLabel>
          <AppText role="body" color="textSecondary">
            A local record of your training, body, and goals.
          </AppText>
          <AppText role="caption" color="textMuted">
            {MEDICAL_REFERENCE}
          </AppText>
        </View>
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
