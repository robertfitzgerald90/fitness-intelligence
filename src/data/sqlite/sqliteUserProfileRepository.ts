import { getDatabase } from '@/data/sqlite/database';
import type { UserProfileRepository } from '@/data/repositories/userProfileRepository';
import { isWeightUnit, type WeightUnit } from '@/domain/models/body';
import {
  isDistanceUnit,
  isExperienceLevel,
  isPreferredActivity,
  isPreferredWorkoutMinutes,
  isPrimaryObjective,
  isSexAtBirth,
  isTrainingLocation,
  LOCAL_USER_ID,
  preferredActivities,
  type DistanceUnit,
  type PreferredActivity,
  type UserProfile,
} from '@/domain/models/profile';

type ProfileRow = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  sex_at_birth: string | null;
  height_cm: number | null;
  preferred_weight_unit: string;
  preferred_distance_unit: string;
  experience_level: string | null;
  primary_objective: string | null;
  training_location: string | null;
  preferred_workouts_per_week: number | null;
  preferred_workout_minutes: number | null;
  created_at: string;
  updated_at: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function toProfile(row: ProfileRow, activities: PreferredActivity[]): UserProfile {
  const weightUnit: WeightUnit = isWeightUnit(row.preferred_weight_unit) ? row.preferred_weight_unit : 'lb';
  const distanceUnit: DistanceUnit = isDistanceUnit(row.preferred_distance_unit) ? row.preferred_distance_unit : 'mi';
  return {
    id: row.id,
    displayName: row.display_name,
    dateOfBirth: row.date_of_birth,
    sexAtBirth: row.sex_at_birth && isSexAtBirth(row.sex_at_birth) ? row.sex_at_birth : null,
    heightCm: row.height_cm,
    preferredWeightUnit: weightUnit,
    preferredDistanceUnit: distanceUnit,
    experienceLevel: row.experience_level && isExperienceLevel(row.experience_level) ? row.experience_level : null,
    primaryObjective:
      row.primary_objective && isPrimaryObjective(row.primary_objective) ? row.primary_objective : null,
    trainingLocation: row.training_location && isTrainingLocation(row.training_location) ? row.training_location : null,
    preferredWorkoutsPerWeek: row.preferred_workouts_per_week,
    preferredWorkoutMinutes:
      row.preferred_workout_minutes != null && isPreferredWorkoutMinutes(row.preferred_workout_minutes)
        ? row.preferred_workout_minutes
        : null,
    preferredActivities: activities,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureProfile(): Promise<ProfileRow> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<ProfileRow>(
    `SELECT id, display_name, date_of_birth, sex_at_birth, height_cm, preferred_weight_unit,
            preferred_distance_unit, experience_level, primary_objective, training_location,
            preferred_workouts_per_week, preferred_workout_minutes, created_at, updated_at
     FROM user_profiles WHERE id = ?`,
    LOCAL_USER_ID,
  );
  if (existing) {
    return existing;
  }
  const timestamp = nowIso();
  await db.runAsync(
    `INSERT INTO user_profiles (
       id, display_name, date_of_birth, sex_at_birth, height_cm, preferred_weight_unit,
       preferred_distance_unit, experience_level, primary_objective, training_location,
       preferred_workouts_per_week, preferred_workout_minutes, created_at, updated_at
     ) VALUES (?, NULL, NULL, NULL, NULL, 'lb', 'mi', NULL, NULL, NULL, NULL, NULL, ?, ?)`,
    LOCAL_USER_ID,
    timestamp,
    timestamp,
  );
  const created = await db.getFirstAsync<ProfileRow>(
    `SELECT id, display_name, date_of_birth, sex_at_birth, height_cm, preferred_weight_unit,
            preferred_distance_unit, experience_level, primary_objective, training_location,
            preferred_workouts_per_week, preferred_workout_minutes, created_at, updated_at
     FROM user_profiles WHERE id = ?`,
    LOCAL_USER_ID,
  );
  if (!created) {
    throw new Error('Profile was not created.');
  }
  return created;
}

export const sqliteUserProfileRepository: UserProfileRepository = {
  async get() {
    const db = await getDatabase();
    const row = await ensureProfile();
    const activityRows = await db.getAllAsync<{ activity: string }>(
      'SELECT activity FROM user_preferred_activities WHERE profile_id = ? ORDER BY activity ASC',
      row.id,
    );
    const activities = activityRows
      .flatMap((item) => (isPreferredActivity(item.activity) ? [item.activity] : []))
      .sort((left, right) => preferredActivities.indexOf(left) - preferredActivities.indexOf(right));
    return toProfile(row, activities);
  },

  async save(profile) {
    const db = await getDatabase();
    const updatedAt = nowIso();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE user_profiles
         SET display_name = ?, date_of_birth = ?, sex_at_birth = ?, height_cm = ?,
             preferred_weight_unit = ?, preferred_distance_unit = ?, experience_level = ?,
             primary_objective = ?, training_location = ?, preferred_workouts_per_week = ?,
             preferred_workout_minutes = ?, updated_at = ?
         WHERE id = ?`,
        profile.displayName,
        profile.dateOfBirth,
        profile.sexAtBirth,
        profile.heightCm,
        profile.preferredWeightUnit,
        profile.preferredDistanceUnit,
        profile.experienceLevel,
        profile.primaryObjective,
        profile.trainingLocation,
        profile.preferredWorkoutsPerWeek,
        profile.preferredWorkoutMinutes,
        updatedAt,
        profile.id,
      );
      await db.runAsync('DELETE FROM user_preferred_activities WHERE profile_id = ?', profile.id);
      for (const activity of profile.preferredActivities) {
        await db.runAsync(
          'INSERT INTO user_preferred_activities (profile_id, activity) VALUES (?, ?)',
          profile.id,
          activity,
        );
      }
    });
    return this.get();
  },
};
