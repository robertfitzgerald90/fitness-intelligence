export type TodayRoute =
  | { name: 'workout-start'; title: string; duration?: string }
  | { name: 'run-start' }
  | { name: 'workout'; id: string }
  | { name: 'strength' }
  | { name: 'goals' };

export type TodayAction = {
  label: string;
  route: TodayRoute;
};

export type RecommendationHero = {
  kind: 'recommendation';
  activityLabel: string;
  title: string;
  contextLine?: string;
  sessionTitle?: string;
  durationLabel?: string;
  explanation: string;
  reasoningTitle: string;
  reasoning: string[];
  primaryAction: TodayAction;
  secondaryAction?: TodayAction;
};

export type InsufficientHistoryHero = {
  kind: 'insufficientHistory';
  title: string;
  explanation: string;
  primaryAction: TodayAction;
};

export type PostWorkoutHero = {
  kind: 'postWorkout';
  title: string;
  durationLabel: string;
  statsLabel: string;
  progressedHeadline: string;
  highlights: { name: string; detail: string }[];
  sinceStarted: { name: string; change: string }[];
  takeawayLabel: string;
  takeaway: string;
};

export type TodayHero = RecommendationHero | InsufficientHistoryHero | PostWorkoutHero;

export type LastWorkoutModel =
  | {
      status: 'ready';
      title: string;
      dateLabel: string;
      durationLabel: string;
      summaryLabel: string;
      highlights: { name: string; performance: string }[];
      progressionLabel: string | null;
      actionLabel: string;
      route: TodayRoute;
    }
  | { status: 'empty'; title: string; message: string };

export type ProgressModel =
  | {
      status: 'ready';
      exerciseName: string;
      headline: string;
      supportingText: string;
      points: number[];
      accessibilityLabel: string;
      actionLabel: string;
      route: TodayRoute;
    }
  | { status: 'empty'; title: string; message: string };

export type GoalItemModel = {
  id: string;
  title: string;
  metricLabel: string;
  valueLabel: string;
  targetLabel?: string;
  progress: number | null;
  progressLabel: string;
};

export type GoalsModel =
  | {
      status: 'ready';
      goals: GoalItemModel[];
      actionLabel: string;
      route: TodayRoute;
    }
  | { status: 'empty'; title: string; message: string };

export type TodayCard =
  | { id: 'lastWorkout'; model: LastWorkoutModel }
  | { id: 'progress'; model: ProgressModel }
  | { id: 'goals'; model: GoalsModel };

export type TodayDashboard = {
  greeting: {
    salutation: string;
    subtitle: string;
  };
  hero: TodayHero;
  cards: TodayCard[];
};
