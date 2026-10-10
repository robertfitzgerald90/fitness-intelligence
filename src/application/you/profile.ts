import { youContainer } from '@/application/you/container';
import { ageInYears, feetInchesFromHeightCm, heightCmFromFeetInches } from '@/domain/profile/bodyStats';
import { localDateFromKey, type LocalDate } from '@/domain/calendar/dates';
import {
  preferredActivities,
  type ExperienceLevel,
  type PreferredActivity,
  type PreferredWorkoutMinutes,
  type PrimaryObjective,
  type SexAtBirth,
  type TrainingLocation,
  type UserProfile,
} from '@/domain/models/profile';

export type SaveResult = { ok: true } | { ok: false; message: string };

export type PersonalSnapshot = {
  name: string | null;
  context: string | null;
};

export type ProfileSuggestion = {
  id: string;
  label: string;
  route: '/you/personal' | '/you/preferences';
};

export type PreferenceLine = {
  label: string;
  value: string;
};

const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const OBJECTIVE_LABELS: Record<PrimaryObjective, string> = {
  build_muscle: 'Build Muscle',
  get_stronger: 'Get Stronger',
  lose_fat: 'Lose Fat',
  improve_endurance: 'Improve Endurance',
  general_fitness: 'General Fitness',
};

const LOCATION_LABELS: Record<TrainingLocation, string> = {
  gym: 'Gym',
  home: 'Home',
  both: 'Both',
};

const ACTIVITY_LABELS: Record<PreferredActivity, string> = {
  strength_training: 'Strength Training',
  running: 'Running',
  walking: 'Walking',
  other: 'Other',
};

const SEX_LABELS: Record<SexAtBirth, string> = {
  female: 'Female',
  male: 'Male',
  intersex: 'Intersex',
  prefer_not_to_say: 'Prefer not to say',
};

export const experienceChoices: { value: ExperienceLevel; label: string; description: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to structured exercise or building consistency.',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Comfortable with regular workouts and common exercises.',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Experienced with structured training and progression.',
  },
];

export const objectiveChoices = (Object.keys(OBJECTIVE_LABELS) as PrimaryObjective[]).map((value) => ({
  value,
  label: OBJECTIVE_LABELS[value],
}));

export const locationChoices = (Object.keys(LOCATION_LABELS) as TrainingLocation[]).map((value) => ({
  value,
  label: LOCATION_LABELS[value],
}));

export const activityChoices = preferredActivities.map((value) => ({
  value,
  label: ACTIVITY_LABELS[value],
}));

export const sexChoices = (Object.keys(SEX_LABELS) as SexAtBirth[]).map((value) => ({
  value,
  label: SEX_LABELS[value],
}));

export const durationChoices: PreferredWorkoutMinutes[] = [30, 45, 60, 90];

export async function loadUserProfile(): Promise<UserProfile> {
  return youContainer.profile.get();
}

export function personalSnapshot(profile: UserProfile): PersonalSnapshot {
  const parts = [
    profile.experienceLevel ? EXPERIENCE_LABELS[profile.experienceLevel] : null,
    profile.primaryObjective ? OBJECTIVE_LABELS[profile.primaryObjective] : null,
  ].filter((part): part is string => part != null);
  return {
    name: profile.displayName,
    context: parts.length > 0 ? parts.join(' · ') : null,
  };
}

export function profileSuggestions(profile: UserProfile): ProfileSuggestion[] {
  const suggestions: ProfileSuggestion[] = [];
  if (!profile.experienceLevel) {
    suggestions.push({
      id: 'experience',
      label: 'Add your training experience',
      route: '/you/preferences',
    });
  }
  if (!profile.primaryObjective) {
    suggestions.push({
      id: 'objective',
      label: 'Set your primary objective',
      route: '/you/preferences',
    });
  }
  if (profile.heightCm == null) {
    suggestions.push({ id: 'height', label: 'Add your height', route: '/you/personal' });
  }
  if (profile.preferredWorkoutsPerWeek == null) {
    suggestions.push({
      id: 'frequency',
      label: 'Set how often you prefer to train',
      route: '/you/preferences',
    });
  }
  if (profile.preferredWorkoutMinutes == null) {
    suggestions.push({
      id: 'duration',
      label: 'Set a preferred workout duration',
      route: '/you/preferences',
    });
  }
  if (!profile.trainingLocation) {
    suggestions.push({ id: 'location', label: 'Choose where you train', route: '/you/preferences' });
  }
  if (profile.preferredActivities.length === 0) {
    suggestions.push({
      id: 'activities',
      label: 'Choose preferred activities',
      route: '/you/preferences',
    });
  }
  return suggestions;
}

export function preferenceLines(profile: UserProfile): PreferenceLine[] {
  const lines: PreferenceLine[] = [];
  if (profile.preferredWorkoutsPerWeek != null) {
    lines.push({ label: 'Preferred workouts', value: `${profile.preferredWorkoutsPerWeek} per week` });
  }
  if (profile.preferredWorkoutMinutes != null) {
    lines.push({ label: 'Preferred duration', value: `${profile.preferredWorkoutMinutes} minutes` });
  }
  if (profile.primaryObjective) {
    lines.push({ label: 'Primary objective', value: OBJECTIVE_LABELS[profile.primaryObjective] });
  }
  if (profile.experienceLevel) {
    lines.push({ label: 'Experience', value: EXPERIENCE_LABELS[profile.experienceLevel] });
  }
  if (profile.trainingLocation) {
    lines.push({ label: 'Training location', value: LOCATION_LABELS[profile.trainingLocation] });
  }
  if (profile.preferredActivities.length > 0) {
    lines.push({
      label: 'Preferred activities',
      value: profile.preferredActivities.map((activity) => ACTIVITY_LABELS[activity]).join(', '),
    });
  }
  return lines;
}

export function ageLabel(dateOfBirth: string | null, today: LocalDate): string | null {
  if (!dateOfBirth) {
    return null;
  }
  const age = ageInYears(dateOfBirth, today);
  if (age == null) {
    return null;
  }
  return age === 1 ? '1 year old' : `${age} years old`;
}

export function heightFields(heightCm: number | null): { feet: string; inches: string } {
  const parts = heightCm == null ? null : feetInchesFromHeightCm(heightCm);
  if (!parts) {
    return { feet: '', inches: '' };
  }
  return { feet: String(parts.feet), inches: String(parts.inches) };
}

export async function savePersonalDetails(input: {
  displayName: string;
  dateOfBirth: string;
  sexAtBirth: SexAtBirth | null;
  feet: string;
  inches: string;
  today: LocalDate;
}): Promise<SaveResult> {
  const displayName = input.displayName.trim();
  if (displayName.length > 40) {
    return { ok: false, message: 'Use a name of 40 characters or fewer.' };
  }
  const dateText = input.dateOfBirth.trim();
  let dateOfBirth: string | null = null;
  if (dateText !== '') {
    const parsed = localDateFromKey(dateText);
    if (!parsed) {
      return { ok: false, message: 'Enter a date of birth as YYYY-MM-DD.' };
    }
    const birthTime = new Date(parsed.year, parsed.monthIndex, parsed.day).getTime();
    const todayTime = new Date(input.today.year, input.today.monthIndex, input.today.day).getTime();
    if (birthTime > todayTime || parsed.year < 1900) {
      return { ok: false, message: 'Enter a date of birth from 1900 through today.' };
    }
    dateOfBirth = dateText;
  }
  const feetText = input.feet.trim();
  const inchesText = input.inches.trim();
  let heightCm: number | null = null;
  if (feetText !== '' || inchesText !== '') {
    const feet = parseWhole(feetText === '' ? '0' : feetText);
    const inches = parseWhole(inchesText === '' ? '0' : inchesText);
    heightCm = feet == null || inches == null ? null : heightCmFromFeetInches(feet, inches);
    if (heightCm == null) {
      return { ok: false, message: 'Enter a height from 3 ft 0 in to 8 ft 0 in, or leave it blank.' };
    }
  }
  const current = await youContainer.profile.get();
  await youContainer.profile.save({
    ...current,
    displayName: displayName === '' ? null : displayName,
    dateOfBirth,
    sexAtBirth: input.sexAtBirth,
    heightCm,
  });
  return { ok: true };
}

export async function saveTrainingPreferences(input: {
  experienceLevel: ExperienceLevel | null;
  primaryObjective: PrimaryObjective | null;
  trainingLocation: TrainingLocation | null;
  workoutsPerWeek: number | null;
  workoutMinutes: PreferredWorkoutMinutes | null;
  activities: PreferredActivity[];
}): Promise<SaveResult> {
  if (input.workoutsPerWeek != null && (input.workoutsPerWeek < 1 || input.workoutsPerWeek > 7)) {
    return { ok: false, message: 'Choose 1 to 7 days per week.' };
  }
  const current = await youContainer.profile.get();
  await youContainer.profile.save({
    ...current,
    experienceLevel: input.experienceLevel,
    primaryObjective: input.primaryObjective,
    trainingLocation: input.trainingLocation,
    preferredWorkoutsPerWeek: input.workoutsPerWeek,
    preferredWorkoutMinutes: input.workoutMinutes,
    preferredActivities: preferredActivities.filter((activity) => input.activities.includes(activity)),
  });
  return { ok: true };
}

function parseWhole(text: string): number | null {
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const value = Number(text);
  return Number.isSafeInteger(value) ? value : null;
}
