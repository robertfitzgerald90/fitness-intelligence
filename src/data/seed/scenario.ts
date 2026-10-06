export type ScenarioId = 'returning' | 'new' | 'lapsed' | 'postWorkout';

/**
 * Development seed scenario.
 * Change this value to preview `new`, `lapsed`, or `postWorkout`.
 * There is no in-app switcher.
 */
export const activeScenario: ScenarioId = 'returning';
