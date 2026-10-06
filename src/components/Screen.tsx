import type { ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edges } from 'react-native-safe-area-context';

import { colors, spacing } from '@/design/tokens';

type Props = {
  children: ReactNode;
  edges?: Edges;
  style?: ViewStyle;
};

export function Screen({ children, edges = ['top', 'left', 'right'], style }: Props) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing[5],
  },
});
