import { listExercises } from '@/application/train/useCases';
import { youContainer } from '@/application/you/container';
import {
  personalSnapshot,
  preferenceLines,
  profileSuggestions,
  type PersonalSnapshot,
  type PreferenceLine,
  type ProfileSuggestion,
} from '@/application/you/profile';
import {
  DEFAULT_WEIGHT_UNIT,
  formatBloodPressure,
  formatBodyFat,
  formatHistoryDay,
  formatLastRecorded,
  formatMeasuredWeight,
  formatPulse,
  formatRecordedMoment,
  formatStrengthDistance,
  formatStrengthTarget,
  formatWeeklyCount,
  formatWeightChange,
  formatWeightDistance,
  todayDateKey,
} from '@/application/you/format';
import { dateKeyForRecord, isFutureDate, recordedAtForDate } from '@/application/you/recordedAt';
import {
  durationToInput,
  formatSetDuration,
  formatWeight,
  parseDurationInput,
  parseWeightInput,
  weightToInput,
} from '@/application/workout/format';
import {
  absoluteDistance,
  countOnDates,
  frequentExercises,
  mostCommonLabel,
  weekDateKeys,
  weightDelta,
} from '@/domain/analytics/personalContext';
import { elapsedMinutes } from '@/domain/analytics/elapsed';
import {
  averageWorkoutsPerWeek,
  buildSessionPoints,
  inclusiveSpanDays,
  mondayWeek,
  periodWindow,
  primaryMetric,
  type ProgressSetRecord,
} from '@/domain/analytics/exerciseProgress';
import type { ExercisePerformance } from '@/domain/analytics/workingWeight';
import type { LocalDate } from '@/domain/calendar/dates';
import type { BodyMeasurement, WeightUnit } from '@/domain/models/body';
import type { Exercise, ExerciseLoggingType } from '@/domain/models/exercise';
import type { PersonalGoal, StrengthGoal } from '@/domain/models/personalGoal';
import type { BloodPressureReading } from '@/domain/models/vitals';
import type { CompletedExerciseSetRecord } from '@/data/repositories/workoutSessionRepository';

export type SaveResult = { ok: true } | { ok: false; message: string };

export type YouSnapshot = {
  value: string;
  context: string;
  extra: string | null;
};

export type YouHome = {
  personal: PersonalSnapshot;
  suggestions: ProfileSuggestion[];
  body: YouSnapshot | null;
  vitals: YouSnapshot | null;
  goals: string[];
  profile: string[];
};

export type HistoryRow = {
  id: string;
  day: string;
  detail: string;
};

export type BodyView = {
  current: string | null;
  change: string | null;
  latestBodyFat: string | null;
  weightPoints: number[];
  bodyFat: { current: string; points: number[]; history: HistoryRow[] } | null;
  history: HistoryRow[];
};

export type VitalView = {
  current: string | null;
  pulse: string | null;
  when: string | null;
  lastRecorded: string | null;
  systolicPoints: number[];
  diastolicPoints: number[];
  history: HistoryRow[];
};

export type GoalCard = {
  id: string;
  title: string;
  target: string;
  lines: string[];
};

export type FitnessProfileView = {
  workoutCount: number;
  mostTrained: string | null;
  recent: string | null;
  exercises: string[];
  averageWorkouts: string | null;
  averageDuration: string | null;
  preferences: PreferenceLine[];
  suggestions: ProfileSuggestion[];
};

export type GoalDraft =
  | {
      id: string;
      type: 'body_weight';
      targetWeight: string;
    }
  | {
      id: string;
      type: 'strength';
      exerciseId: string | null;
      loggingType: ExerciseLoggingType;
      targetWeight: string;
      targetReps: string;
      targetDuration: string;
    }
  | {
      id: string;
      type: 'training_frequency';
      workoutsPerWeek: string;
    };

const RECENT_DAYS = 30;

export async function getYouHome(today: LocalDate): Promise<YouHome> {
  const [body, vitals, goals, profile, user] = await Promise.all([
    getBody(today),
    getVitals(today),
    getGoals(today),
    getFitnessProfile(today),
    youContainer.profile.get(),
  ]);
  return {
    personal: personalSnapshot(user),
    suggestions: profileSuggestions(user),
    body: body.current
      ? {
          value: body.current,
          context: body.change ?? 'First measurement recorded',
          extra: body.latestBodyFat,
        }
      : null,
    vitals: vitals.current
      ? {
          value: vitals.current,
          context: vitals.lastRecorded ?? 'Recorded',
          extra: vitals.pulse,
        }
      : null,
    goals: goals.slice(0, 3).map((goal) => goal.rootLine),
    profile: profileLines(profile),
  };
}

export async function getBody(today: LocalDate): Promise<BodyView> {
  const measurements = await youContainer.body.list();
  const chronological = [...measurements].reverse();
  const latest = measurements[0] ?? null;
  const first = chronological[0] ?? null;
  const fatEntries = measurements.filter((entry) => entry.bodyFatPercent != null);
  const latestFat = fatEntries[0] ?? null;
  return {
    current: latest ? formatMeasuredWeight(latest.weight, latest.weightUnit) : null,
    latestBodyFat:
      latest?.bodyFatPercent != null ? `${formatBodyFat(latest.bodyFatPercent)} body fat` : null,
    change:
      latest && first && measurements.length > 1
        ? formatWeightChange(weightDelta(first.weight, latest.weight), latest.weightUnit)
        : null,
    weightPoints: chronological.map((entry) => entry.weight),
    bodyFat: latestFat
      ? {
          current: formatBodyFat(latestFat.bodyFatPercent ?? 0),
          points: [...fatEntries]
            .reverse()
            .map((entry) => entry.bodyFatPercent)
            .filter((value): value is number => value != null),
          history: fatEntries.map((entry) => ({
            id: entry.id,
            day: formatHistoryDay(entry.recordedAt, today),
            detail: formatBodyFat(entry.bodyFatPercent ?? 0),
          })),
        }
      : null,
    history: measurements.map((entry) => ({
      id: entry.id,
      day: formatHistoryDay(entry.recordedAt, today),
      detail: formatMeasuredWeight(entry.weight, entry.weightUnit),
    })),
  };
}

export async function loadBodyEntry(id: string): Promise<BodyMeasurement | null> {
  return youContainer.body.getById(id);
}

export async function saveBodyMeasurement(input: {
  id: string | null;
  weightText: string;
  bodyFatText: string;
  dateText: string;
  existingRecordedAt: string | null;
  now: Date;
}): Promise<SaveResult> {
  const weight = parseWeightInput(input.weightText);
  if (weight == null || weight <= 0 || weight >= 2000) {
    return { ok: false, message: 'Enter a weight.' };
  }
  const bodyFatText = input.bodyFatText.trim();
  let bodyFatPercent: number | null = null;
  if (bodyFatText !== '') {
    const bodyFat = parseWeightInput(bodyFatText);
    if (bodyFat == null || bodyFat <= 0 || bodyFat > 100) {
      return { ok: false, message: 'Enter a body fat percentage, or leave it blank.' };
    }
    bodyFatPercent = bodyFat;
  }
  const recordedAt = resolveRecordedAt(input.dateText, input.existingRecordedAt, input.now);
  if (!recordedAt) {
    return { ok: false, message: dateMessage(input.dateText, input.now) };
  }
  await youContainer.body.save({
    id: input.id,
    weight,
    weightUnit: DEFAULT_WEIGHT_UNIT,
    bodyFatPercent,
    recordedAt,
  });
  return { ok: true };
}

export async function deleteBodyMeasurement(id: string): Promise<void> {
  await youContainer.body.delete(id);
}

export async function getVitals(today: LocalDate): Promise<VitalView> {
  const readings = await youContainer.vitals.list();
  const chronological = [...readings].reverse();
  const latest = readings[0] ?? null;
  return {
    current: latest ? formatBloodPressure(latest.systolic, latest.diastolic) : null,
    pulse: latest?.pulse != null ? formatPulse(latest.pulse) : null,
    when: latest ? formatRecordedMoment(latest.recordedAt, today) : null,
    lastRecorded: latest ? formatLastRecorded(latest.recordedAt, today) : null,
    systolicPoints: chronological.map((reading) => reading.systolic),
    diastolicPoints: chronological.map((reading) => reading.diastolic),
    history: readings.map((reading) => ({
      id: reading.id,
      day: formatHistoryDay(reading.recordedAt, today),
      detail: readingDetail(reading),
    })),
  };
}

export async function loadVitalEntry(id: string): Promise<BloodPressureReading | null> {
  return youContainer.vitals.getById(id);
}

export async function saveBloodPressure(input: {
  id: string | null;
  systolicText: string;
  diastolicText: string;
  pulseText: string;
  dateText: string;
  existingRecordedAt: string | null;
  now: Date;
}): Promise<SaveResult> {
  const systolic = parseWhole(input.systolicText);
  const diastolic = parseWhole(input.diastolicText);
  if (systolic == null || diastolic == null || systolic < 40 || systolic > 300 || diastolic < 20 || diastolic > 250) {
    return { ok: false, message: 'Enter systolic and diastolic values.' };
  }
  if (systolic <= diastolic) {
    return { ok: false, message: 'Enter a systolic value above the diastolic value.' };
  }
  const pulseText = input.pulseText.trim();
  let pulse: number | null = null;
  if (pulseText !== '') {
    pulse = parseWhole(pulseText);
    if (pulse == null || pulse < 20 || pulse > 250) {
      return { ok: false, message: 'Enter a pulse, or leave it blank.' };
    }
  }
  const recordedAt = resolveRecordedAt(input.dateText, input.existingRecordedAt, input.now);
  if (!recordedAt) {
    return { ok: false, message: dateMessage(input.dateText, input.now) };
  }
  await youContainer.vitals.save({
    id: input.id,
    systolic,
    diastolic,
    pulse,
    recordedAt,
  });
  return { ok: true };
}

export async function deleteBloodPressure(id: string): Promise<void> {
  await youContainer.vitals.delete(id);
}

export async function getGoals(today: LocalDate): Promise<(GoalCard & { rootLine: string })[]> {
  const goals = (await youContainer.goals.list()).filter((goal) => goal.type !== 'running');
  const needsSessions = goals.some((goal) => goal.type === 'training_frequency' || goal.type === 'strength');
  const needsWeight = goals.some((goal) => goal.type === 'body_weight');
  const [measurements, sessions, sets] = await Promise.all([
    needsWeight ? youContainer.body.list() : Promise.resolve([]),
    needsSessions ? completedSessions() : Promise.resolve([]),
    goals.some((goal) => goal.type === 'strength') ? completedSets() : Promise.resolve([]),
  ]);
  const weekKeys = weekDateKeys(mondayWeek(today));
  const weekCount = countOnDates(
    sessions.map((session) => session.completedAt),
    weekKeys,
  );
  const points = buildSessionPoints(sets.map(toProgressRecord));
  return goals.map((goal) => describeGoal(goal, measurements, weekCount, points));
}

export async function loadGoal(id: string): Promise<PersonalGoal | null> {
  return youContainer.goals.getById(id);
}

export async function loadGoalExercises(): Promise<Exercise[]> {
  return listExercises();
}

export async function saveGoal(input: {
  id: string | null;
  type: 'body_weight' | 'strength' | 'training_frequency';
  targetWeightText: string;
  exerciseId: string | null;
  targetRepsText: string;
  targetDurationText: string;
  workoutsPerWeekText: string;
}): Promise<SaveResult> {
  const existing = await youContainer.goals.list();
  if (input.type === 'body_weight') {
    const duplicate = existing.find((goal) => goal.type === 'body_weight' && goal.id !== input.id);
    if (duplicate) {
      return { ok: false, message: 'You already have this goal. Edit it instead.' };
    }
    const targetWeight = parseWeightInput(input.targetWeightText);
    if (targetWeight == null || targetWeight <= 0 || targetWeight >= 2000) {
      return { ok: false, message: 'Enter a target weight.' };
    }
    await youContainer.goals.save({
      id: input.id,
      type: 'body_weight',
      targetWeight,
      weightUnit: DEFAULT_WEIGHT_UNIT,
      exerciseId: null,
      exerciseName: null,
      loggingType: null,
      targetReps: null,
      targetDurationSeconds: null,
      workoutsPerWeek: null,
    });
    return { ok: true };
  }

  if (input.type === 'training_frequency') {
    const duplicate = existing.find((goal) => goal.type === 'training_frequency' && goal.id !== input.id);
    if (duplicate) {
      return { ok: false, message: 'You already have this goal. Edit it instead.' };
    }
    const workoutsPerWeek = parseWhole(input.workoutsPerWeekText);
    if (workoutsPerWeek == null || workoutsPerWeek < 1 || workoutsPerWeek > 14) {
      return { ok: false, message: 'Enter a weekly target from 1 to 14.' };
    }
    await youContainer.goals.save({
      id: input.id,
      type: 'training_frequency',
      targetWeight: null,
      weightUnit: null,
      exerciseId: null,
      exerciseName: null,
      loggingType: null,
      targetReps: null,
      targetDurationSeconds: null,
      workoutsPerWeek,
    });
    return { ok: true };
  }

  if (!input.exerciseId) {
    return { ok: false, message: 'Choose an exercise.' };
  }
  const duplicate = existing.find(
    (goal) => goal.type === 'strength' && goal.exerciseId === input.exerciseId && goal.id !== input.id,
  );
  if (duplicate) {
    return { ok: false, message: 'You already have this goal. Edit it instead.' };
  }
  const exercise = (await listExercises()).find((item) => item.id === input.exerciseId);
  if (!exercise) {
    return { ok: false, message: 'Choose an exercise.' };
  }
  const target = strengthTarget(exercise.loggingType, input);
  if (!target.ok) {
    return target;
  }
  await youContainer.goals.save({
    id: input.id,
    type: 'strength',
    targetWeight: target.targetWeight,
    weightUnit: target.targetWeight == null ? null : DEFAULT_WEIGHT_UNIT,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    loggingType: exercise.loggingType,
    targetReps: target.targetReps,
    targetDurationSeconds: target.targetDurationSeconds,
    workoutsPerWeek: null,
  });
  return { ok: true };
}

export async function deleteGoal(id: string): Promise<void> {
  await youContainer.goals.delete(id);
}

export async function getFitnessProfile(today: LocalDate): Promise<FitnessProfileView> {
  const window = periodWindow('30d', today);
  const [allSessions, recentSessions, sets, user] = await Promise.all([
    youContainer.sessions.getCompletedSessionsInRange('1970-01-01T00:00:00.000Z', window.endIso),
    window.startIso
      ? youContainer.sessions.getCompletedSessionsInRange(window.startIso, window.endIso)
      : Promise.resolve([]),
    youContainer.sessions.listCompletedExerciseSets({
      startInclusive: null,
      endExclusive: window.endIso,
    }),
    youContainer.profile.get(),
  ]);
  const declared = {
    preferences: preferenceLines(user),
    suggestions: profileSuggestions(user),
  };
  const workoutCount = allSessions.length;
  if (workoutCount === 0) {
    return {
      workoutCount: 0,
      mostTrained: null,
      recent: null,
      exercises: [],
      averageWorkouts: null,
      averageDuration: null,
      ...declared,
    };
  }
  const earliest = allSessions[0]?.completedAt ?? window.endIso;
  const spanDays = Math.max(7, inclusiveSpanDays(earliest, today));
  const durationMinutes = allSessions.reduce(
    (total, session) => total + elapsedMinutes(session.startedAt, session.completedAt),
    0,
  );
  const recent =
    recentSessions.length === 0
      ? 'No workouts in the last 30 days.'
      : `${averageWorkoutsPerWeek(recentSessions.length, RECENT_DAYS).toFixed(1)} workouts / week recently`;
  return {
    workoutCount,
    mostTrained: mostCommonLabel(allSessions.map((session) => session.name)),
    recent,
    exercises: frequentExercises(uniqueExerciseSessions(sets)),
    averageWorkouts: `${averageWorkoutsPerWeek(workoutCount, spanDays).toFixed(1)} per week`,
    averageDuration: `${Math.round(durationMinutes / workoutCount)} minutes`,
    ...declared,
  };
}

export function bodyEntryDate(entry: BodyMeasurement | null, today: LocalDate): string {
  return entry ? dateKeyForRecord(entry.recordedAt, todayDateKey(today)) : todayDateKey(today);
}

export function vitalEntryDate(entry: BloodPressureReading | null, today: LocalDate): string {
  return entry ? dateKeyForRecord(entry.recordedAt, todayDateKey(today)) : todayDateKey(today);
}

export function goalDraftFrom(goal: PersonalGoal): GoalDraft | null {
  if (goal.type === 'body_weight') {
    return { id: goal.id, type: 'body_weight', targetWeight: weightToInput(goal.targetWeight) };
  }
  if (goal.type === 'training_frequency') {
    return { id: goal.id, type: 'training_frequency', workoutsPerWeek: String(goal.workoutsPerWeek) };
  }
  if (goal.type === 'strength') {
    return {
      id: goal.id,
      type: 'strength',
      exerciseId: goal.exerciseId,
      loggingType: goal.loggingType,
      targetWeight: weightToInput(goal.targetWeight),
      targetReps: goal.targetReps == null ? '' : String(goal.targetReps),
      targetDuration: durationToInput(goal.targetDurationSeconds),
    };
  }
  return null;
}

function profileLines(profile: FitnessProfileView): string[] {
  if (profile.workoutCount === 0) {
    return [];
  }
  const lines = [`${profile.workoutCount} workouts recorded`];
  if (profile.recent) {
    lines.push(profile.recent);
  }
  return lines;
}

function readingDetail(reading: BloodPressureReading): string {
  const pressure = formatBloodPressure(reading.systolic, reading.diastolic);
  return reading.pulse == null ? pressure : `${pressure} · ${formatPulse(reading.pulse)}`;
}

function resolveRecordedAt(dateText: string, existingRecordedAt: string | null, now: Date): string | null {
  const key = dateText.trim();
  if (existingRecordedAt) {
    const existingKey = dateKeyForRecord(existingRecordedAt, '');
    if (existingKey === key) {
      return existingRecordedAt;
    }
  }
  return recordedAtForDate(key, now);
}

function dateMessage(dateText: string, now: Date): string {
  if (isFutureDate(dateText, now)) {
    return 'Choose today or an earlier date.';
  }
  return 'Enter a date as YYYY-MM-DD.';
}

function parseWhole(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  return Number.isSafeInteger(value) ? value : null;
}

async function completedSessions() {
  const end = new Date(Date.now() + 86_400_000).toISOString();
  return youContainer.sessions.getCompletedSessionsInRange('1970-01-01T00:00:00.000Z', end);
}

async function completedSets() {
  return youContainer.sessions.listCompletedExerciseSets({
    startInclusive: null,
    endExclusive: null,
  });
}

function uniqueExerciseSessions(sets: CompletedExerciseSetRecord[]): { exerciseId: string; exerciseName: string }[] {
  const seen = new Set<string>();
  const entries: { exerciseId: string; exerciseName: string }[] = [];
  for (const set of sets) {
    const key = `${set.sessionId}\0${set.exerciseId}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    entries.push({ exerciseId: set.exerciseId, exerciseName: set.exerciseName });
  }
  return entries;
}

function toProgressRecord(record: CompletedExerciseSetRecord): ProgressSetRecord {
  return {
    sessionId: record.sessionId,
    sessionName: record.sessionName,
    startedAt: record.startedAt,
    completedAt: record.completedAt,
    exerciseId: record.exerciseId,
    exerciseName: record.exerciseName,
    loggingType: record.loggingType,
    weight: record.weight,
    reps: record.reps,
    durationSeconds: record.durationSeconds,
    sortOrder: record.sortOrder,
  };
}

function describeGoal(
  goal: PersonalGoal,
  measurements: BodyMeasurement[],
  weekCount: number,
  points: ReturnType<typeof buildSessionPoints>,
): GoalCard & { rootLine: string } {
  if (goal.type === 'body_weight') {
    const current = measurements[0] ?? null;
    const lines = current
      ? [
          `Current ${formatMeasuredWeight(current.weight, current.weightUnit)}`,
          formatWeightDistance(absoluteDistance(current.weight, goal.targetWeight), goal.weightUnit),
        ]
      : ['Log a body weight to see progress.'];
    return {
      id: goal.id,
      title: 'Body Weight',
      target: formatMeasuredWeight(goal.targetWeight, goal.weightUnit),
      lines,
      rootLine: `${formatMeasuredWeight(goal.targetWeight, goal.weightUnit)} body weight`,
    };
  }
  if (goal.type === 'training_frequency') {
    return {
      id: goal.id,
      title: 'Training Frequency',
      target: `${goal.workoutsPerWeek} workouts / week`,
      lines: ['This week', formatWeeklyCount(weekCount, goal.workoutsPerWeek)],
      rootLine: `${goal.workoutsPerWeek} workouts / week`,
    };
  }
  if (goal.type === 'strength') {
    return describeStrength(goal, points);
  }
  return {
    id: goal.id,
    title: 'Goal',
    target: '',
    lines: [],
    rootLine: 'Goal',
  };
}

function describeStrength(
  goal: StrengthGoal,
  points: ReturnType<typeof buildSessionPoints>,
): GoalCard & { rootLine: string } {
  const unit: WeightUnit = DEFAULT_WEIGHT_UNIT;
  const target = formatStrengthTarget(
    goal.loggingType,
    goal.targetWeight,
    goal.targetReps,
    goal.targetDurationSeconds,
    unit,
  );
  const latest = goal.exerciseId
    ? [...points]
        .reverse()
        .find((point) => point.exerciseId === goal.exerciseId && point.performance.loggingType === goal.loggingType)
    : undefined;
  const lines = !goal.exerciseId
    ? ['This exercise is no longer available.']
    : latest
      ? strengthLines(goal, latest.performance, unit)
      : ['No sessions recorded yet.'];
  return {
    id: goal.id,
    title: goal.exerciseName,
    target,
    lines,
    rootLine: strengthRoot(goal, unit),
  };
}

function strengthLines(goal: StrengthGoal, performance: ExercisePerformance, unit: WeightUnit): string[] {
  const current = primaryMetric(performance);
  if (goal.loggingType === 'reps' && goal.targetReps != null && performance.loggingType === 'reps') {
    return [`Current ${performance.reps} reps`, formatStrengthDistance('reps', current, goal.targetReps, unit)];
  }
  if (
    goal.loggingType === 'duration_weight' &&
    goal.targetDurationSeconds != null &&
    performance.loggingType === 'duration_weight'
  ) {
    return [
      `Current ${formatSetDuration(performance.durationSeconds)}`,
      formatStrengthDistance('duration_weight', current, goal.targetDurationSeconds, unit),
    ];
  }
  if (goal.loggingType === 'weight_reps' && goal.targetWeight != null && performance.loggingType === 'weight_reps') {
    return [
      `Current ${formatMeasuredWeight(performance.weight, unit)}`,
      formatStrengthDistance('weight_reps', current, goal.targetWeight, unit),
    ];
  }
  return ['No sessions recorded yet.'];
}

function strengthRoot(goal: StrengthGoal, unit: WeightUnit): string {
  if (goal.loggingType === 'reps' && goal.targetReps != null) {
    return `${goal.targetReps} reps ${goal.exerciseName}`;
  }
  if (goal.loggingType === 'duration_weight' && goal.targetDurationSeconds != null) {
    return `${formatSetDuration(goal.targetDurationSeconds)} ${goal.exerciseName}`;
  }
  if (goal.targetWeight != null) {
    return `${formatWeight(goal.targetWeight)} ${unit} ${goal.exerciseName}`;
  }
  return goal.exerciseName;
}

function strengthTarget(
  loggingType: ExerciseLoggingType,
  input: { targetWeightText: string; targetRepsText: string; targetDurationText: string },
):
  | { ok: true; targetWeight: number | null; targetReps: number | null; targetDurationSeconds: number | null }
  | { ok: false; message: string } {
  if (loggingType === 'reps') {
    const targetReps = parseWhole(input.targetRepsText);
    if (targetReps == null || targetReps < 1 || targetReps > 999) {
      return { ok: false, message: 'Enter a target.' };
    }
    return { ok: true, targetWeight: null, targetReps, targetDurationSeconds: null };
  }
  if (loggingType === 'duration_weight') {
    const targetDurationSeconds = parseDurationInput(input.targetDurationText);
    if (targetDurationSeconds == null) {
      return { ok: false, message: 'Enter a target.' };
    }
    return { ok: true, targetWeight: null, targetReps: null, targetDurationSeconds };
  }
  const targetWeight = parseWeightInput(input.targetWeightText);
  if (targetWeight == null || targetWeight <= 0 || targetWeight >= 2000) {
    return { ok: false, message: 'Enter a target.' };
  }
  return { ok: true, targetWeight, targetReps: null, targetDurationSeconds: null };
}
