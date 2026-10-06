import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { spacing } from '@/design/tokens';

type Props = {
  salutation: string;
  subtitle: string;
};

export function TodayHeader({ salutation, subtitle }: Props) {
  return (
    <View style={styles.header} accessibilityRole="header">
      <AppText role="title3">{salutation}</AppText>
      <AppText role="body" color="textSecondary">
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing[1],
    paddingTop: spacing[2],
  },
});
