import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { getTodayDashboard } from '@/application/today/getTodayDashboard';
import type { TodayCard, TodayDashboard } from '@/application/today/todayViewModel';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { spacing } from '@/design/tokens';
import { GoalsCard } from '@/features/today/GoalsCard';
import { LastWorkoutCard } from '@/features/today/LastWorkoutCard';
import { ProgressCard } from '@/features/today/ProgressCard';
import { TodayHeader } from '@/features/today/TodayHeader';
import { TodayTrainingCard } from '@/features/today/TodayTrainingCard';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; dashboard: TodayDashboard }
  | { status: 'error' };

export function TodayScreen() {
  const state = useTodayDashboard();

  return (
    <Screen>
      {state.status === 'error' ? (
        <EmptyState title="Today is unavailable" message="The dashboard couldn't load right now." />
      ) : null}
      {state.status === 'ready' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <TodayHeader salutation={state.dashboard.greeting.salutation} subtitle={state.dashboard.greeting.subtitle} />
          <TodayTrainingCard hero={state.dashboard.hero} />
          {state.dashboard.cards.map((card) => (
            <TodayCardView key={card.id} card={card} />
          ))}
        </ScrollView>
      ) : null}
    </Screen>
  );
}

function TodayCardView({ card }: { card: TodayCard }) {
  switch (card.id) {
    case 'lastWorkout':
      return <LastWorkoutCard model={card.model} />;
    case 'progress':
      return <ProgressCard model={card.model} />;
    case 'goals':
      return <GoalsCard model={card.model} />;
    default: {
      const exhaustive: never = card;
      return exhaustive;
    }
  }
}

function useTodayDashboard(): LoadState {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    getTodayDashboard()
      .then((dashboard) => {
        if (!cancelled) {
          setState({ status: 'ready', dashboard });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'error' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
});
