import { container } from '@/application/container';
import {
  calendarDaysBetween,
  daysAgoPhrase,
  formatClock,
  formatLoadSet,
  formatSessionDate,
} from '@/application/today/format';
import { greetingForHour } from '@/application/today/greeting';
import type {
  GoalItemModel,
  GoalsModel,
  LastWorkoutModel,
  ProgressModel,
  TodayDashboard,
  TodayHero,
} from '@/application/today/todayViewModel';
import { todayCopy } from '@/data/seed/copy';
import type { ScenarioId } from '@/data/seed/scenario';
import { goalProgressRatio } from '@/domain/analytics/goalProgress';
import { strengthChange } from '@/domain/analytics/strengthProgress';
import type { ExerciseHistory } from '@/domain/models/progress';
import type { WorkoutSession } from '@/domain/models/workout';

export async function getTodayDashboard(now = new Date()): Promise<TodayDashboard> {
  const scenario = container.scenario;
  const [profile, sessions, history, goals] = await Promise.all([
    container.profile.getProfile(),
    container.workouts.getSessions(now),
    container.history.getHighlighted(now),
    container.goals.getActive(2),
  ]);

  return {
    greeting: {
      salutation: greetingForHour(now.getHours(), profile.firstName),
      subtitle: todayCopy.subtitles[scenario],
    },
    hero: buildHero(scenario, sessions, history, now),
    cards: [
      { id: 'lastWorkout', model: buildLastWorkout(sessions, scenario, now) },
      { id: 'progress', model: buildProgress(history) },
      { id: 'goals', model: buildGoals(goals) },
    ],
  };
}

export async function getWorkoutPreview(id: string): Promise<{ title: string; meta: string } | null> {
  const sessions = await container.workouts.getSessions(new Date());
  const session = sessions.find((item) => item.id === id);
  if (!session) {
    return null;
  }
  return {
    title: session.title,
    meta: `${session.durationMinutes} min · ${session.exerciseCount} exercises · ${session.setCount} sets`,
  };
}

export async function getStrengthPreview(): Promise<{ title: string; headline: string } | null> {
  const dashboard = await getTodayDashboard();
  const card = dashboard.cards.find((item) => item.id === 'progress');
  if (!card || card.model.status !== 'ready') {
    return null;
  }
  return { title: card.model.exerciseName, headline: card.model.headline };
}

export async function getGoalsPreview(): Promise<{ title: string; detail: string }[]> {
  const dashboard = await getTodayDashboard();
  const card = dashboard.cards.find((item) => item.id === 'goals');
  if (!card || card.model.status !== 'ready') {
    return [];
  }
  return card.model.goals.map((goal) => ({
    title: goal.title,
    detail: [goal.metricLabel, goal.valueLabel, goal.targetLabel]
      .filter((part) => part !== undefined)
      .join(' · '),
  }));
}

function buildHero(
  scenario: ScenarioId,
  sessions: WorkoutSession[],
  history: ExerciseHistory | null,
  now: Date,
): TodayHero {
  if (scenario === 'new') {
    return {
      kind: 'insufficientHistory',
      title: todayCopy.newUser.title,
      explanation: todayCopy.newUser.explanation,
      primaryAction: {
        label: 'Start Workout',
        route: { name: 'workout-start', title: 'First workout' },
      },
    };
  }

  if (scenario === 'postWorkout') {
    const summary = todayCopy.postWorkout;
    return {
      kind: 'postWorkout',
      title: summary.title,
      durationLabel: summary.durationLabel,
      statsLabel: summary.statsLabel,
      progressedHeadline: summary.progressedHeadline,
      highlights: summary.highlights.map((item) => ({ name: item.name, detail: item.detail })),
      sinceStarted: summary.sinceStarted.map((item) => ({ name: item.name, change: item.change })),
      takeawayLabel: summary.takeawayLabel,
      takeaway: summary.takeaway,
    };
  }

  if (scenario === 'lapsed') {
    const latest = newest(sessions);
    const days = latest ? calendarDaysBetween(latest.completedAt, now) : 8;
    const gap = `You haven't trained in ${days} days.`;
    return {
      kind: 'recommendation',
      activityLabel: 'Strength',
      title: todayCopy.lapsed.title,
      contextLine: gap,
      sessionTitle: todayCopy.lapsed.sessionTitle,
      explanation: todayCopy.lapsed.explanation,
      reasoningTitle: todayCopy.lapsed.reasoningTitle,
      reasoning: [gap, ...todayCopy.lapsed.reasoning],
      primaryAction: {
        label: 'Start Workout',
        route: { name: 'workout-start', title: todayCopy.lapsed.sessionTitle, duration: '30' },
      },
    };
  }

  const upper = newest(sessions.filter((session) => session.focus === 'upper'));
  const lower = newest(sessions.filter((session) => session.focus === 'lower'));
  const upperPhrase = upper ? daysAgoPhrase(calendarDaysBetween(upper.completedAt, now)) : 'a few days ago';
  const lowerPhrase = lower ? daysAgoPhrase(calendarDaysBetween(lower.completedAt, now)) : 'recently';
  const change = history ? strengthChange(history.points) : null;
  const trendingUp = (change?.deltaLb ?? 0) > 0;

  return {
    kind: 'recommendation',
    activityLabel: 'Strength',
    title: 'Upper Body',
    durationLabel: '~45 min',
    explanation: `You trained lower body ${lowerPhrase}. Your last upper-body session was ${upperPhrase}.`,
    reasoningTitle: 'Why Upper Body?',
    reasoning: [
      `Your last upper-body workout was ${upperPhrase}.`,
      `You trained lower body ${lowerPhrase}.`,
      trendingUp
        ? 'Your recent upper-body performance is trending upward.'
        : 'This is a good day to train upper body again.',
    ],
    primaryAction: {
      label: 'Start Workout',
      route: { name: 'workout-start', title: 'Upper Body', duration: '45' },
    },
    secondaryAction: {
      label: 'Start Run',
      route: { name: 'run-start' },
    },
  };
}

function buildLastWorkout(sessions: WorkoutSession[], scenario: ScenarioId, now: Date): LastWorkoutModel {
  const session = sessionForTodayCard(sessions, scenario);
  if (!session) {
    return {
      status: 'empty',
      title: todayCopy.empty.lastWorkoutTitle,
      message: todayCopy.empty.lastWorkoutMessage,
    };
  }

  const progression =
    session.progressedExerciseCount > 0
      ? `${session.progressedExerciseCount} ${session.progressedExerciseCount === 1 ? 'exercise' : 'exercises'} progressed`
      : null;

  return {
    status: 'ready',
    title: session.title,
    dateLabel: formatSessionDate(session.completedAt, now),
    durationLabel: `${session.durationMinutes} min`,
    summaryLabel: `${session.exerciseCount} exercises · ${session.setCount} sets`,
    highlights: session.highlights.map((highlight) => ({
      name: highlight.exerciseName,
      performance: formatLoadSet(highlight.weightLb, highlight.reps),
    })),
    progressionLabel: progression,
    actionLabel: 'View workout',
    route: { name: 'workout', id: session.id },
  };
}

function sessionForTodayCard(sessions: WorkoutSession[], scenario: ScenarioId): WorkoutSession | null {
  // The returning example features the upper-body session even when a lower-body
  // session is more recent. That lower-body session still informs the recommendation.
  if (scenario === 'returning') {
    return newest(sessions.filter((session) => session.focus === 'upper')) ?? newest(sessions);
  }
  return newest(sessions);
}

function buildProgress(history: ExerciseHistory | null): ProgressModel {
  if (!history) {
    return {
      status: 'empty',
      title: todayCopy.empty.progressTitle,
      message: todayCopy.empty.progressMessage,
    };
  }

  const change = strengthChange(history.points);
  if (!change) {
    return {
      status: 'empty',
      title: todayCopy.empty.progressTitle,
      message: todayCopy.empty.progressMessage,
    };
  }

  const first = history.points[0]?.weightLb;
  const last = history.points[history.points.length - 1]?.weightLb;
  const supportingText =
    change.deltaLb > 0
      ? todayCopy.progressSupport.up
      : change.deltaLb < 0
        ? todayCopy.progressSupport.down
        : todayCopy.progressSupport.flat;

  return {
    status: 'ready',
    exerciseName: history.exerciseName,
    headline: change.headline,
    supportingText,
    points: history.points.map((point) => point.weightLb),
    accessibilityLabel: `Working weight from ${first ?? 0} to ${last ?? 0} pounds across ${history.points.length} sessions.`,
    actionLabel: 'View strength progress',
    route: { name: 'strength' },
  };
}

function buildGoals(goals: Awaited<ReturnType<typeof container.goals.getActive>>): GoalsModel {
  if (goals.length === 0) {
    return {
      status: 'empty',
      title: todayCopy.empty.goalsTitle,
      message: todayCopy.empty.goalsMessage,
    };
  }

  return {
    status: 'ready',
    goals: goals.map(toGoalItem),
    actionLabel: 'View goals',
    route: { name: 'goals' },
  };
}

function toGoalItem(goal: Awaited<ReturnType<typeof container.goals.getActive>>[number]): GoalItemModel {
  const progress = goalProgressRatio(goal);
  if (goal.unit === 'lb') {
    return {
      id: goal.id,
      title: goal.title,
      metricLabel: goal.metricLabel,
      valueLabel: `${goal.currentValue} → ${goal.targetValue} lb`,
      progress,
      progressLabel: `${goal.metricLabel}, ${goal.currentValue} pounds toward ${goal.targetValue} pounds`,
    };
  }

  return {
    id: goal.id,
    title: goal.title,
    metricLabel: 'Current best',
    valueLabel: formatClock(goal.currentValue),
    targetLabel: `Under ${formatClock(goal.targetValue)}`,
    progress,
    progressLabel: `Current best ${formatClock(goal.currentValue)}, target under ${formatClock(goal.targetValue)}`,
  };
}

function newest(sessions: WorkoutSession[]): WorkoutSession | null {
  return (
    [...sessions].sort((left, right) => (left.completedAt < right.completedAt ? 1 : -1))[0] ?? null
  );
}
