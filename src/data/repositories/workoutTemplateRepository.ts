import type { WorkoutTemplate, WorkoutTemplateInput, WorkoutTemplateSummary } from '@/domain/models/workoutTemplate';

export interface WorkoutTemplateRepository {
  list(): Promise<WorkoutTemplateSummary[]>;
  getById(id: string): Promise<WorkoutTemplate | null>;
  save(input: WorkoutTemplateInput): Promise<WorkoutTemplate>;
  delete(id: string): Promise<void>;
}
