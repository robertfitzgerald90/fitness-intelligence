import { sqliteBodyMeasurementRepository } from '@/data/sqlite/sqliteBodyMeasurementRepository';
import { sqliteGoalRepository } from '@/data/sqlite/sqliteGoalRepository';
import { sqliteVitalRepository } from '@/data/sqlite/sqliteVitalRepository';
import { trainContainer } from '@/application/train/container';

export const youContainer = {
  body: sqliteBodyMeasurementRepository,
  vitals: sqliteVitalRepository,
  goals: sqliteGoalRepository,
  sessions: trainContainer.sessions,
  exercises: trainContainer.exercises,
};
