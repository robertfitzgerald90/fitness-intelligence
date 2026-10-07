import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { dayAccessibilityLabel, formatMonthTitle } from '@/application/calendar/format';
import {
  getCalendarMonth,
  type CalendarDayView,
  type CalendarMonthView,
} from '@/application/calendar/getCalendarMonth';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SectionLabel } from '@/components/SectionLabel';
import { TextAction } from '@/components/TextAction';
import { colors, spacing } from '@/design/tokens';
import {
  buildMonthWeeks,
  dateInMonth,
  localDateFromDate,
  localDateFromKey,
  localDateKey,
  sameLocalDate,
  shiftMonth,
  type LocalDate,
} from '@/domain/calendar/dates';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function CalendarScreen() {
  const [today, setToday] = useState(() => localDateFromDate(new Date()));
  const [visible, setVisible] = useState(() => ({ year: today.year, monthIndex: today.monthIndex }));
  const [selected, setSelected] = useState<LocalDate>(today);
  const [view, setView] = useState<CalendarMonthView | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const now = localDateFromDate(new Date());
      setToday((current) => (sameLocalDate(current, now) ? current : now));
      let cancelled = false;
      getCalendarMonth({
        year: visible.year,
        monthIndex: visible.monthIndex,
        selected,
        today: now,
      })
        .then((next) => {
          if (!cancelled) {
            setView(next);
            setFailed(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFailed(true);
          }
        });
      return () => {
        cancelled = true;
      };
    }, [selected, visible.monthIndex, visible.year]),
  );

  const selectedKey = localDateKey(selected);
  const showing =
    view &&
    view.year === visible.year &&
    view.monthIndex === visible.monthIndex &&
    view.selectedDateKey === selectedKey
      ? view
      : null;
  const weeks = showing?.weeks ?? pendingWeeks(visible.year, visible.monthIndex, selected, today);
  const awayFromToday = visible.year !== today.year || visible.monthIndex !== today.monthIndex;

  function showMonth(delta: number) {
    const next = shiftMonth(visible.year, visible.monthIndex, delta);
    setVisible(next);
    setSelected(dateInMonth(next.year, next.monthIndex, selected.day));
  }

  function returnToToday() {
    const now = localDateFromDate(new Date());
    setToday(now);
    setVisible({ year: now.year, monthIndex: now.monthIndex });
    setSelected(now);
  }

  function selectDay(dateKey: string) {
    const date = localDateFromKey(dateKey);
    if (date) {
      setSelected(date);
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <SectionLabel>Calendar</SectionLabel>
          <View style={styles.monthRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => showMonth(-1)}
              hitSlop={4}
              style={styles.navButton}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <AppText role="title2" style={styles.monthTitle}>
              {formatMonthTitle(visible.year, visible.monthIndex)}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={() => showMonth(1)}
              hitSlop={4}
              style={styles.navButton}
            >
              <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
          {awayFromToday ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return to today"
              onPress={returnToToday}
              style={styles.todayButton}
            >
              <AppText role="bodyStrong" color="primary">
                Today
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {failed ? (
          <AppText role="body" color="textSecondary">
            Calendar could not be loaded.
          </AppText>
        ) : null}

        <View style={styles.summary}>
          <SectionLabel>This month</SectionLabel>
          <AppText role="body" color="textSecondary">
            {showing?.summary.workouts ?? ' '}
          </AppText>
          <AppText role="body" color="textSecondary">
            {showing?.summary.sets ?? ' '}
          </AppText>
          <AppText role="body" color="textSecondary">
            {showing?.summary.duration ?? ' '}
          </AppText>
        </View>

        <View style={styles.grid}>
          <View style={styles.weekRow}>
            {WEEKDAYS.map((label) => (
              <View key={label} style={styles.cell}>
                <AppText role="caption" color="textMuted" style={styles.weekday}>
                  {label}
                </AppText>
              </View>
            ))}
          </View>
          {weeks.map((week) => (
            <View key={week[0]?.dateKey ?? 'week'} style={styles.weekRow}>
              {week.map((day) => (
                <DayCell key={day.dateKey} day={day} onPress={selectDay} />
              ))}
            </View>
          ))}
        </View>

        {showing ? (
          <View style={styles.daySection}>
            <SectionLabel>{showing.selectedTitle}</SectionLabel>
            {showing.workouts.length === 0 ? (
              <AppText role="body" color="textSecondary">
                No workouts recorded.
              </AppText>
            ) : (
              showing.workouts.map((workout) => (
                <View key={workout.id} style={styles.workout}>
                  <AppText role="bodyStrong">{workout.name}</AppText>
                  <AppText role="small" color="textSecondary">
                    {workout.meta}
                  </AppText>
                  <AppText role="small" color="textMuted">
                    {workout.completedLabel}
                  </AppText>
                  <TextAction
                    label="View Workout"
                    onPress={() => router.push({ pathname: '/workout/[id]', params: { id: workout.id } })}
                  />
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function pendingWeeks(
  year: number,
  monthIndex: number,
  selected: LocalDate,
  today: LocalDate,
): CalendarDayView[][] {
  return buildMonthWeeks(year, monthIndex).map((week) =>
    week.map((date) => {
      const isToday = sameLocalDate(date, today);
      const isSelected = sameLocalDate(date, selected);
      return {
        dateKey: localDateKey(date),
        dayNumber: date.day,
        inMonth: date.year === year && date.monthIndex === monthIndex,
        isToday,
        isSelected,
        accessibilityLabel: dayAccessibilityLabel({
          date,
          isToday,
          isSelected,
          activities: [],
        }),
        indicators: { strength: false, run: false },
      };
    }),
  );
}

function DayCell({ day, onPress }: { day: CalendarDayView; onPress: (dateKey: string) => void }) {
  const numberColor = day.isSelected || day.inMonth ? 'textPrimary' : 'textMuted';
  return (
    <View style={styles.cell}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={day.accessibilityLabel}
        accessibilityState={{ selected: day.isSelected }}
        onPress={() => onPress(day.dateKey)}
        style={({ pressed }) => [styles.dayButton, pressed && styles.pressed]}
      >
        <View style={[styles.dayNumber, day.isToday && styles.todayNumber, day.isSelected && styles.selectedNumber]}>
          <AppText role="small" color={numberColor} style={styles.tabular}>
            {day.dayNumber}
          </AppText>
        </View>
        <View style={styles.dots}>
          {day.indicators.strength ? <View style={[styles.dot, styles.strengthDot]} /> : null}
          {day.indicators.run ? <View style={[styles.dot, styles.runDot]} /> : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
  header: {
    gap: spacing[1],
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    gap: spacing[1],
  },
  grid: {
    gap: spacing[1],
  },
  weekRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  weekday: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dayButton: {
    width: '100%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[1],
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayNumber: {
    borderColor: colors.primary,
  },
  selectedNumber: {
    backgroundColor: colors.primarySubtle,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  dots: {
    height: 8,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  strengthDot: {
    backgroundColor: colors.strength,
  },
  runDot: {
    backgroundColor: colors.run,
  },
  pressed: {
    opacity: 0.7,
  },
  daySection: {
    gap: spacing[3],
  },
  workout: {
    gap: spacing[1],
  },
});
