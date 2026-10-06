import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, type, type ColorName, type TypeRole } from '@/design/tokens';

type Props = {
  children: ReactNode;
  role?: TypeRole;
  color?: ColorName;
  style?: StyleProp<TextStyle>;
};

const tabularRoles = new Set<TypeRole>(['metric', 'metricLarge']);

export function AppText({ children, role = 'body', color = 'textPrimary', style }: Props) {
  return (
    <Text
      style={[
        type[role],
        { color: colors[color] },
        tabularRoles.has(role) ? styles.tabular : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
