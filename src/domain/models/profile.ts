import type { WeightUnit } from '@/domain/models/body';

export const LOCAL_USER_ID = 'local-user';

export const sexAtBirthOptions = ['female', 'male', 'intersex', 'prefer_not_to_say'] as const;
export type SexAtBirth = (typeof sexAtBirthOptions)[number];

export const experienceLevels = ['beginner', 'intermediate', 'advanced'] as const;
export type ExperienceLevel = (typeof experienceLevels)[number];

export const primaryObjectives = [
  'build_muscle',
  'get_stronger',
  'lose_fat',
  'improve_endurance',
  'general_fitness',
] as const;
export type PrimaryObjective = (typeof primaryObjectives)[number];

export const trainingLocations = ['gym', 'home', 'both'] as const;
export type TrainingLocation = (typeof trainingLocations)[number];

export const preferredDurations = [30, 45, 60, 90] as const;
export type PreferredWorkoutMinutes = (typeof preferredDurations)[number];

export const preferredActivities = ['strength_training', 'running', 'walking', 'other'] as const;
export type PreferredActivity = (typeof preferredActivities)[number];

export const distanceUnits = ['mi', 'km'] as const;
export type DistanceUnit = (typeof distanceUnits)[number];

/** Declared identity and training preferences for the local user. Observed training is calculated elsewhere. */
export type UserProfile = {
  id: string;
  displayName: string | null;
  dateOfBirth: string | null;
  sexAtBirth: SexAtBirth | null;
  heightCm: number | null;
  preferredWeightUnit: WeightUnit;
  preferredDistanceUnit: DistanceUnit;
  experienceLevel: ExperienceLevel | null;
  primaryObjective: PrimaryObjective | null;
  trainingLocation: TrainingLocation | null;
  preferredWorkoutsPerWeek: number | null;
  preferredWorkoutMinutes: PreferredWorkoutMinutes | null;
  preferredActivities: PreferredActivity[];
  createdAt: string;
  updatedAt: string;
};

/** Greeting identity for the Today prototype. It is not the stored profile. */
export type TodayGreetingProfile = {
  id: string;
  firstName: string;
};

export function isSexAtBirth(value: string): value is SexAtBirth {
  return (sexAtBirthOptions as readonly string[]).includes(value);
}

export function isExperienceLevel(value: string): value is ExperienceLevel {
  return (experienceLevels as readonly string[]).includes(value);
}

export function isPrimaryObjective(value: string): value is PrimaryObjective {
  return (primaryObjectives as readonly string[]).includes(value);
}

export function isTrainingLocation(value: string): value is TrainingLocation {
  return (trainingLocations as readonly string[]).includes(value);
}

export function isPreferredWorkoutMinutes(value: number): value is PreferredWorkoutMinutes {
  return (preferredDurations as readonly number[]).includes(value);
}

export function isPreferredActivity(value: string): value is PreferredActivity {
  return (preferredActivities as readonly string[]).includes(value);
}

export function isDistanceUnit(value: string): value is DistanceUnit {
  return (distanceUnits as readonly string[]).includes(value);
}
