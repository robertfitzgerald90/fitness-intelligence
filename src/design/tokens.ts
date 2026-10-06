export const colors = {
  background: '#0B0D10',
  surface: '#12161B',
  surfaceElevated: '#181D24',
  surfaceSubtle: '#20262E',

  textPrimary: '#F7F9FC',
  textSecondary: '#AAB4C0',
  textMuted: '#727D8A',

  border: '#252C35',
  borderStrong: '#343D48',

  primary: '#5B8CFF',
  primaryPressed: '#4778EA',
  primarySubtle: '#17264A',

  positive: '#43C783',
  warning: '#F2B84B',
  negative: '#EF6A6A',
  info: '#66A3FF',

  strength: '#5B8CFF',
  run: '#43C783',
  scrim: 'rgba(0, 0, 0, 0.55)',
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  title1: { fontSize: 26, lineHeight: 32, fontWeight: '700' as const },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  title3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontWeight: '600' as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  metricLarge: { fontSize: 34, lineHeight: 38, fontWeight: '700' as const },
  metric: { fontSize: 24, lineHeight: 28, fontWeight: '700' as const },
} as const;

export type ColorName = keyof typeof colors;
export type TypeRole = keyof typeof type;
