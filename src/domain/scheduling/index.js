import { assertStrategy } from './contract';
import { fsrs6Strategy, newFsrsState, nextFsrsState, recallProbability } from './fsrs6';
import { leitnerStrategy } from './leitner';

export { Grade, GRADES, isCorrect, isValidGrade } from './grades';

/** Strategies available in the MVP (decision P4). */
export const STRATEGIES = Object.freeze([fsrs6Strategy, leitnerStrategy].map(assertStrategy));

export const DEFAULT_STRATEGY_ID = fsrs6Strategy.id;

export function getStrategy(id) {
  return STRATEGIES.find((s) => s.id === id) ?? fsrs6Strategy;
}

/** Days elapsed since the word was last seen (reviewed or created). */
export function elapsedDays(card, now) {
  const since = new Date(card.lastReviewedAt ?? card.createdAt);
  return Math.max(0, (now.getTime() - since.getTime()) / 86_400_000);
}

/** Card for a new word, with an FSRS-6 shadow state for later comparison. */
export function createReviewCard(term, strategyId, now) {
  return { ...getStrategy(strategyId).createCard(term, now), fsrsShadow: newFsrsState(now) };
}

/**
 * Applies an answer to a card with the strategy that owns it.
 * Shadow mode: whatever the strategy, the FSRS-6 shadow state is also updated
 * and its recall prediction (made before answering) is returned, so FSRS can
 * be evaluated against the user's own answers.
 *
 * @returns {{ card: import('./contract').ReviewCard, predictedRecall: number|null, elapsedDays: number }}
 */
export function applyReview(card, grade, now) {
  const shadow = card.fsrsShadow ?? newFsrsState(new Date(card.createdAt));
  const predictedRecall = recallProbability(shadow, now);
  const elapsed = elapsedDays(card, now);
  const reviewed = getStrategy(card.strategy).review(card, grade, now);
  return {
    card: { ...reviewed, fsrsShadow: nextFsrsState(shadow, grade, now) },
    predictedRecall,
    elapsedDays: elapsed,
  };
}

/** Cards for saved words that do not have one yet (migration of existing words). */
export function missingCards(terms, cards, strategyId, now) {
  const existing = new Set(cards.map((c) => c.term));
  return terms.filter((t) => !existing.has(t)).map((t) => createReviewCard(t, strategyId, now));
}

/** Cards due now, oldest due first. */
export function dueCards(cards, now) {
  return cards
    .filter((card) => getStrategy(card.strategy).isDue(card, now))
    .sort((a, b) => new Date(a.due) - new Date(b.due));
}

/** Date of the next review among cards that are not due yet. */
export function nextDueDate(cards, now) {
  const upcoming = cards
    .map((c) => new Date(c.due))
    .filter((d) => d.getTime() > now.getTime())
    .sort((a, b) => a - b);
  return upcoming[0] ?? null;
}
