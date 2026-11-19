/**
 * Catalog of MVP ideas that can be switched on and off (FR-010).
 * Only implemented ideas appear in the navigation and in the Lab.
 */
export const IDEAS = Object.freeze([
  {
    id: 'learn',
    number: 19,
    title: 'Essential vocabulary path',
    description: 'New words every day, most useful first (NGSL).',
  },
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
  {
    id: 'pronunciation',
    number: 2,
    title: 'Pronunciation',
    description: 'Say the word aloud and find out if it was understood.',
  },
  {
    id: 'images',
    number: 12,
    title: 'Images',
    description: 'A pictogram that shows the meaning of nouns and verbs (ARASAAC).',
  },
  {
    id: 'translation',
    number: null,
    title: 'Spanish help',
    description: 'Optional Spanish translation of words and definitions (on-device).',
  },
]);

export const DEFAULT_FLAGS = Object.freeze(
  Object.fromEntries(IDEAS.map((idea) => [idea.id, true])),
);
