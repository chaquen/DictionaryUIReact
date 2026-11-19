/**
 * Strategy pattern for spaced-repetition algorithms.
 *
 * A scheduling algorithm is pure calculation (not data access), so it is a
 * strategy rather than a repository: it can be swapped or compared without
 * touching storage or UI. Cards are plain JSON so any repository can store them.
 *
 * @typedef {Object} ReviewCard
 * @property {string} term
 * @property {string} strategy        Id of the strategy that owns `state`
 * @property {string} due             ISO date-time of the next review
 * @property {Object} state           Strategy-specific state
 * @property {number} reviews
 * @property {number} lapses          Times the word was forgotten
 * @property {string} createdAt       ISO date-time
 * @property {string|null} lastReviewedAt
 *
 * @typedef {Object} SchedulingStrategy
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {(term: string, now: Date) => ReviewCard} createCard
 * @property {(card: ReviewCard, grade: number, now: Date) => ReviewCard} review
 * @property {(card: ReviewCard, now: Date) => boolean} isDue
 * @property {(card: ReviewCard, now: Date) => number} [predictRecall]  Probability (0–1)
 */

export const SCHEDULING_METHODS = ['createCard', 'review', 'isDue'];

/** Fails fast when a strategy does not fulfill the contract. */
export function assertStrategy(strategy) {
  const missing = SCHEDULING_METHODS.filter((m) => typeof strategy?.[m] !== 'function');
  if (!strategy?.id || missing.length > 0) {
    throw new TypeError(`SchedulingStrategy is missing: ${['id', ...missing].join(', ')}`);
  }
  return strategy;
}

/** Fields every strategy shares when it creates a card. */
export function baseCard(term, strategyId, now, state, due = now) {
  return {
    term,
    strategy: strategyId,
    due: new Date(due).toISOString(),
    state,
    reviews: 0,
    lapses: 0,
    createdAt: now.toISOString(),
    lastReviewedAt: null,
  };
}

export const isDueAt = (card, now) => new Date(card.due).getTime() <= now.getTime();
