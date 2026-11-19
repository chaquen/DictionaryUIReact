/**
 * Catalog of MVP ideas that can be switched on and off (FR-010).
 * Only implemented ideas appear in the navigation and in the Lab.
 */
export const IDEAS = Object.freeze([
  {
    id: 'review',
    number: 1,
    title: 'Spaced repetition',
    description: 'Review your words right before you forget them.',
  },
  {
    id: 'gamification',
    number: 18,
    title: 'Game mechanics',
    description: 'Streaks, experience points, levels and achievements.',
  },
]);

export const DEFAULT_FLAGS = Object.freeze(
  Object.fromEntries(IDEAS.map((idea) => [idea.id, true])),
);
