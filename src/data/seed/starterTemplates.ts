export type StarterTemplate = {
  id: string;
  name: string;
  exerciseIds: string[];
};

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'template-upper-body',
    name: 'Upper Body',
    exerciseIds: [
      'ex-machine-bench-press',
      'ex-lat-pulldown',
      'ex-cable-row',
      'ex-shoulder-press',
      'ex-hammer-curl',
      'ex-tricep-pushdown',
    ],
  },
  {
    id: 'template-lower-body',
    name: 'Lower Body',
    exerciseIds: [
      'ex-back-squat',
      'ex-romanian-deadlift',
      'ex-leg-press',
      'ex-leg-curl',
      'ex-calf-raise',
    ],
  },
  {
    id: 'template-full-body',
    name: 'Full Body',
    exerciseIds: [
      'ex-back-squat',
      'ex-machine-bench-press',
      'ex-lat-pulldown',
      'ex-shoulder-press',
      'ex-leg-press',
      'ex-cable-row',
      'ex-plank',
    ],
  },
];
