import { sqliteBodyMeasurementRepository } from '@/data/sqlite/sqliteBodyMeasurementRepository';
import { sqliteGoalRepository } from '@/data/sqlite/sqliteGoalRepository';
import { sqliteUserProfileRepository } from '@/data/sqlite/sqliteUserProfileRepository';
import { sqliteVitalRepository } from '@/data/sqlite/sqliteVitalRepository';
import { trainContainer } from '@/application/train/container';

export const youContainer = {
  profile: sqliteUserProfileRepository,
  body: sqliteBodyMeasurementRepository,
  vitals: sqliteVitalRepository,
  goals: sqliteGoalRepository,
  sessions: trainContainer.sessions,
  exercises: trainContainer.exercises,
};
