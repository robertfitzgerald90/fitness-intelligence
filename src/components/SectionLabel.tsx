import { StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { spacing } from '@/design/tokens';

type Props = {
  children: string;
};

export function SectionLabel({ children }: Props) {
  return (
    <AppText role="caption" color="textMuted" style={styles.label}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  label: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing[1],
  },
});
