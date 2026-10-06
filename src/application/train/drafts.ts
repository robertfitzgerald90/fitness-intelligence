import type { ExerciseCategory } from '@/domain/models/exercise';
import type { WorkoutTemplate } from '@/domain/models/workoutTemplate';

export type DraftExercise = {
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
};

export type TemplateDraft = {
  templateId: string | null;
  name: string;
  exercises: DraftExercise[];
};

export type SessionDraft = {
  templateId: string;
  name: string;
  exercises: DraftExercise[];
};

let templateDraft: TemplateDraft | null = null;
let sessionDraft: SessionDraft | null = null;

export function getTemplateDraft(): TemplateDraft | null {
  return templateDraft;
}

export function beginNewTemplateDraft(): TemplateDraft {
  templateDraft = { templateId: null, name: '', exercises: [] };
  return templateDraft;
}

export function beginEditTemplateDraft(template: WorkoutTemplate): TemplateDraft {
  templateDraft = {
    templateId: template.id,
    name: template.name,
    exercises: template.exercises.map(toDraftExercise),
  };
  return templateDraft;
}

export function updateTemplateDraft(draft: TemplateDraft): void {
  templateDraft = draft;
}

export function clearTemplateDraft(): void {
  templateDraft = null;
}

export function addExerciseToTemplateDraft(exercise: DraftExercise): 'added' | 'duplicate' | 'missing' {
  if (!templateDraft) {
    return 'missing';
  }
  if (templateDraft.exercises.some((item) => item.exerciseId === exercise.exerciseId)) {
    return 'duplicate';
  }
  templateDraft = {
    ...templateDraft,
    exercises: [...templateDraft.exercises, exercise],
  };
  return 'added';
}

export function getSessionDraft(): SessionDraft | null {
  return sessionDraft;
}

export function clearSessionDraft(): void {
  sessionDraft = null;
}

export function beginSessionDraft(template: WorkoutTemplate): SessionDraft {
  sessionDraft = {
    templateId: template.id,
    name: template.name,
    exercises: template.exercises.map(toDraftExercise),
  };
  return sessionDraft;
}

export function updateSessionDraft(draft: SessionDraft): void {
  sessionDraft = draft;
}

export function addExerciseToSessionDraft(exercise: DraftExercise): 'added' | 'duplicate' | 'missing' {
  if (!sessionDraft) {
    return 'missing';
  }
  if (sessionDraft.exercises.some((item) => item.exerciseId === exercise.exerciseId)) {
    return 'duplicate';
  }
  sessionDraft = {
    ...sessionDraft,
    exercises: [...sessionDraft.exercises, exercise],
  };
  return 'added';
}

export function moveDraftExercise<T extends { exercises: DraftExercise[] }>(
  draft: T,
  index: number,
  direction: -1 | 1,
): T {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= draft.exercises.length) {
    return draft;
  }
  const exercises = draft.exercises.slice();
  const [item] = exercises.splice(index, 1);
  if (!item) {
    return draft;
  }
  exercises.splice(nextIndex, 0, item);
  return { ...draft, exercises };
}

function toDraftExercise(exercise: WorkoutTemplate['exercises'][number]): DraftExercise {
  return {
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    category: exercise.category,
  };
}
