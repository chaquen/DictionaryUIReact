import { createEmptyCard, fsrs, generatorParameters } from 'ts-fsrs';
import { baseCard, isDueAt } from './contract';
import { Grade } from './grades';

/**
 * FSRS-6 (ts-fsrs 5.x): the most accurate algorithm in the open
 * srs-benchmark. Fuzz is disabled so schedules are reproducible.
 */
const scheduler = fsrs(generatorParameters({ enable_fuzz: false }));

const toJson = (card) => ({
  ...card,
  due: card.due.toISOString(),
  last_review: card.last_review ? card.last_review.toISOString() : null,
});

const fromJson = (state) => ({
  ...state,
  due: new Date(state.due),
  last_review: state.last_review ? new Date(state.last_review) : undefined,
});

/** New FSRS memory state. */
export const newFsrsState = (now) => toJson(createEmptyCard(now));

/** FSRS memory state after answering with `grade`. */
export const nextFsrsState = (state, grade, now) =>
  toJson(scheduler.next(fromJson(state), now, grade).card);

/** Probability (0–1) of recalling the word now, according to FSRS-6. */
export function recallProbability(state, now) {
  if (!state?.last_review) return null; // Never reviewed: FSRS has no estimate yet.
  return scheduler.get_retrievability(fromJson(state), now, false);
}

/** @type {import('./contract').SchedulingStrategy} */
export const fsrs6Strategy = {
  id: 'fsrs6',
  name: 'FSRS-6',
  description: 'Adaptive memory model. The most accurate algorithm in the open spaced-repetition benchmark.',

  createCard(term, now) {
    const state = newFsrsState(now);
    return baseCard(term, this.id, now, state, state.due);
  },

  review(card, grade, now) {
    const state = nextFsrsState(card.state, grade, now);
    return {
      ...card,
      state,
      due: state.due,
      reviews: card.reviews + 1,
      lapses: card.lapses + (grade === Grade.AGAIN ? 1 : 0),
      lastReviewedAt: now.toISOString(),
    };
  },

  isDue: (card, now) => isDueAt(card, now),

  predictRecall: (card, now) => recallProbability(card.state, now),
};
