/**
 * Learning events: the single source of truth for metrics (FR-009) and for
 * game mechanics (#18). Every idea records what the user did as an event.
 *
 * @typedef {Object} LearningEvent
 * @property {string} id
 * @property {string} at        ISO date-time
 * @property {string} idea      One of `Idea`
 * @property {string} type      One of `EventType`
 * @property {string|null} term Word involved, if any
 * @property {boolean|null} correct  Outcome, when the action can succeed or fail
 * @property {Object} meta      Idea-specific data
 */

export const Idea = Object.freeze({
  COLLECTION: 'collection',
  REVIEW: 'review',
  LEARN: 'learn',
  TRANSLATION: 'translation',
  IMAGES: 'images',
});

export const EventType = Object.freeze({
  WORD_SAVED: 'word_saved',
  WORD_REVIEWED: 'word_reviewed',
  WORD_MARKED_KNOWN: 'word_marked_known',
  PLACEMENT_COMPLETED: 'placement_completed',
  TRANSLATION_SHOWN: 'translation_shown',
  IMAGE_SHOWN: 'image_shown',
  IMAGE_REJECTED: 'image_rejected',
});

let sequence = 0;
const newId = (now) => `${now.getTime().toString(36)}-${(sequence++).toString(36)}`;

/**
 * @param {{ idea: string, type: string, term?: string|null, correct?: boolean|null, meta?: Object }} input
 * @param {Date} [now]
 * @returns {LearningEvent}
 */
export function createEvent({ idea, type, term = null, correct = null, meta = {} }, now = new Date()) {
  return { id: newId(now), at: now.toISOString(), idea, type, term, correct, meta };
}

/** Local calendar day ("YYYY-MM-DD") of a date, used for streaks and active days. */
export function dayKey(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Day key of `date` shifted by `days` (negative goes back). */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const isLearningEvent = (value) =>
  Boolean(value) &&
  typeof value.id === 'string' &&
  typeof value.at === 'string' &&
  typeof value.idea === 'string' &&
  typeof value.type === 'string';
