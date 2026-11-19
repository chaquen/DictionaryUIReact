import { describe, expect, it } from 'vitest';
import { assertStrategy } from './contract';
import {
  Grade,
  STRATEGIES,
  applyReview,
  createReviewCard,
  dueCards,
  getStrategy,
  missingCards,
  nextDueDate,
} from './index';
import { LEITNER_INTERVALS, leitnerStrategy } from './leitner';

const NOW = new Date('2026-11-19T10:00:00Z');
const days = (n) => new Date(NOW.getTime() + n * 86_400_000);

// Same contract tests for every strategy (Strategy pattern).
describe.each(STRATEGIES)('SchedulingStrategy contract: $name', (strategy) => {
  it('fulfills the contract', () => {
    expect(() => assertStrategy(strategy)).not.toThrow();
  });

  it('creates a card that is due immediately', () => {
    const card = strategy.createCard('serendipity', NOW);
    expect(card).toMatchObject({ term: 'serendipity', strategy: strategy.id, reviews: 0, lapses: 0 });
    expect(strategy.isDue(card, NOW)).toBe(true);
  });

  it('remembering pushes the next review further than forgetting', () => {
    const card = strategy.createCard('serendipity', NOW);
    const forgot = strategy.review(card, Grade.AGAIN, NOW);
    const remembered = strategy.review(card, Grade.GOOD, NOW);

    expect(new Date(remembered.due).getTime()).toBeGreaterThan(new Date(forgot.due).getTime());
    expect(forgot.lapses).toBe(1);
    expect(remembered.lapses).toBe(0);
    expect(remembered.reviews).toBe(1);
    expect(remembered.lastReviewedAt).toBe(NOW.toISOString());
  });

  it('produces JSON-serializable cards', () => {
    const card = strategy.review(strategy.createCard('serendipity', NOW), Grade.GOOD, NOW);
    expect(JSON.parse(JSON.stringify(card))).toEqual(card);
  });

  it('a card is not due before its date and is due after it', () => {
    const card = strategy.review(strategy.createCard('serendipity', NOW), Grade.GOOD, NOW);
    expect(strategy.isDue(card, NOW)).toBe(false);
    expect(strategy.isDue(card, new Date(card.due))).toBe(true);
  });
});

describe('leitnerStrategy', () => {
  it('moves up one box when remembered, two when easy, back to box 1 when forgotten', () => {
    let card = leitnerStrategy.createCard('run', NOW);
    card = leitnerStrategy.review(card, Grade.GOOD, NOW);
    expect(card.state.box).toBe(2);
    expect(card.due).toBe(days(LEITNER_INTERVALS[1]).toISOString());

    card = leitnerStrategy.review(card, Grade.EASY, NOW);
    expect(card.state.box).toBe(4);

    card = leitnerStrategy.review(card, Grade.HARD, NOW);
    expect(card.state.box).toBe(4);

    card = leitnerStrategy.review(card, Grade.AGAIN, NOW);
    expect(card.state.box).toBe(1);
    expect(card.due).toBe(days(1).toISOString());
  });

  it('never goes beyond the last box', () => {
    let card = leitnerStrategy.createCard('run', NOW);
    for (let i = 0; i < 10; i += 1) card = leitnerStrategy.review(card, Grade.EASY, NOW);
    expect(card.state.box).toBe(LEITNER_INTERVALS.length);
  });
});

describe('review helpers', () => {
  it('falls back to FSRS-6 for unknown strategies', () => {
    expect(getStrategy('unknown').id).toBe('fsrs6');
  });

  it('keeps an FSRS-6 shadow and reports its prediction for any strategy', () => {
    const card = createReviewCard('run', 'leitner', NOW);
    const first = applyReview(card, Grade.GOOD, NOW);
    expect(first.predictedRecall).toBeNull(); // never reviewed before
    expect(first.card.state.box).toBe(2);
    expect(first.card.fsrsShadow.reps).toBe(1);

    const second = applyReview(first.card, Grade.GOOD, days(2));
    expect(second.predictedRecall).toBeGreaterThan(0);
    expect(second.predictedRecall).toBeLessThanOrEqual(1);
    expect(second.elapsedDays).toBeCloseTo(2);
  });

  it('creates cards only for words without one', () => {
    const existing = [createReviewCard('run', 'fsrs6', NOW)];
    const created = missingCards(['run', 'bank'], existing, 'leitner', NOW);
    expect(created.map((c) => [c.term, c.strategy])).toEqual([['bank', 'leitner']]);
  });

  it('lists due cards oldest first and finds the next due date', () => {
    const a = { ...createReviewCard('a', 'fsrs6', NOW), due: days(-2).toISOString() };
    const b = { ...createReviewCard('b', 'fsrs6', NOW), due: days(-1).toISOString() };
    const c = { ...createReviewCard('c', 'fsrs6', NOW), due: days(3).toISOString() };

    expect(dueCards([b, c, a], NOW).map((x) => x.term)).toEqual(['a', 'b']);
    expect(nextDueDate([a, b, c], NOW)).toEqual(days(3));
  });
});
