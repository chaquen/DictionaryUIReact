import { addDays } from '../learningEvent';
import { baseCard, isDueAt } from './contract';
import { Grade } from './grades';

/** Review interval (days) of each box: box 1 → 1 day … box 5 → 16 days. */
export const LEITNER_INTERVALS = Object.freeze([1, 2, 4, 8, 16]);
const LAST_BOX = LEITNER_INTERVALS.length;

function nextBox(box, grade) {
  switch (grade) {
    case Grade.AGAIN:
      return 1;
    case Grade.HARD:
      return box;
    case Grade.EASY:
      return Math.min(box + 2, LAST_BOX);
    default:
      return Math.min(box + 1, LAST_BOX);
  }
}

/**
 * Leitner boxes: the simplest system to understand and show in a game.
 * Forgetting sends the word back to box 1; remembering moves it up.
 *
 * @type {import('./contract').SchedulingStrategy}
 */
export const leitnerStrategy = {
  id: 'leitner',
  name: 'Leitner boxes',
  description: '5 boxes reviewed every 1, 2, 4, 8 and 16 days. Simple and predictable.',

  createCard(term, now) {
    return baseCard(term, this.id, now, { box: 1 }, now);
  },

  review(card, grade, now) {
    const box = nextBox(card.state.box, grade);
    return {
      ...card,
      state: { box },
      due: addDays(now, LEITNER_INTERVALS[box - 1]).toISOString(),
      reviews: card.reviews + 1,
      lapses: card.lapses + (grade === Grade.AGAIN ? 1 : 0),
      lastReviewedAt: now.toISOString(),
    };
  },

  isDue: (card, now) => isDueAt(card, now),
};
