export const todayCopy = {
  subtitles: {
    returning: 'Ready to get after it?',
    new: "Log a session whenever you're ready.",
    lapsed: 'Good to see you.',
    postWorkout: 'Nice work.',
  },
  newUser: {
    title: 'Ready for your first workout?',
    explanation: 'Log a few sessions and Fitness Intelligence will begin learning how you train.',
  },
  lapsed: {
    title: "Let's get moving again",
    sessionTitle: '30-Minute Full Body',
    explanation: 'A shorter session is a good way to get back into your rhythm.',
    reasoningTitle: 'Why this session?',
    reasoning: [
      'A shorter session is easier to start after time away.',
      'Full body lets you move again without a long workout.',
    ],
  },
  empty: {
    lastWorkoutTitle: 'No workouts yet',
    lastWorkoutMessage: 'Your last session will show up here after you train.',
    progressTitle: 'Your progress starts here',
    progressMessage:
      "Once you've logged a few workouts, you'll begin seeing trends and improvements here.",
    goalsTitle: 'No goals yet',
    goalsMessage: "When you choose something to work toward, it will show up here.",
  },
  progressSupport: {
    up: "You're lifting substantially more than when you began tracking this exercise.",
    down: 'This is below your first logged session. The history is here whenever you want it.',
    flat: 'This exercise is holding at the same load since you started tracking it.',
  },
  postWorkout: {
    title: 'Upper Body',
    durationLabel: '52 min',
    statsLabel: '24 sets · 18,420 lb volume',
    progressedHeadline: 'You progressed on 4 exercises.',
    highlights: [
      { name: 'Machine Bench Press', detail: '110 × 10 → 110 × 12 ↑' },
      { name: 'Cable Row', detail: '70 × 10 → 75 × 10 ↑' },
      { name: 'Lat Pulldown', detail: '100 × 10 → 100 × 11 ↑' },
    ],
    sinceStarted: [
      { name: 'Machine Bench', change: '+35 lb' },
      { name: 'Lat Pulldown', change: '+25 lb' },
      { name: 'Cable Row', change: '+20 lb' },
    ],
    takeawayLabel: 'Key takeaway',
    takeaway:
      'Your upper-body strength continues to trend upward. You added repetitions or weight to four movements tonight without increasing workout duration.',
  },
} as const;
