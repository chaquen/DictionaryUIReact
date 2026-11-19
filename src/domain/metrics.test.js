import { describe, expect, it } from 'vitest';
import { EventType, Idea, createEvent } from './learningEvent';
import { reviewStats, summarizeByIdea } from './metrics';

const review = (iso, correct, meta = {}) =>
  createEvent({ idea: Idea.REVIEW, type: EventType.WORD_REVIEWED, term: 'w', correct, meta }, new Date(iso));

describe('summarizeByIdea', () => {
  it('counts uses, active days and success rate per idea', () => {
    const events = [
      createEvent({ idea: Idea.COLLECTION, type: EventType.WORD_SAVED, term: 'a' }, new Date('2026-11-18T10:00:00')),
      review('2026-11-18T10:00:00', true),
      review('2026-11-18T11:00:00', false),
      review('2026-11-19T10:00:00', true),
    ];

    expect(summarizeByIdea(events)).toEqual([
      { idea: 'review', uses: 3, activeDays: 2, successRate: 2 / 3 },
      { idea: 'collection', uses: 1, activeDays: 1, successRate: null },
    ]);
  });

  it('is empty without events', () => {
    expect(summarizeByIdea([])).toEqual([]);
  });
});

describe('reviewStats', () => {
  it('measures recall after long gaps, per strategy', () => {
    const events = [
      review('2026-11-18T10:00:00', true, { elapsedDays: 8, strategy: 'fsrs6' }),
      review('2026-11-18T10:00:00', false, { elapsedDays: 10, strategy: 'leitner' }),
      review('2026-11-18T10:00:00', true, { elapsedDays: 1, strategy: 'fsrs6' }),
    ];
    const stats = reviewStats(events);

    expect(stats).toMatchObject({ reviews: 3, longGapReviews: 2, longGapRecall: 0.5, successRate: 2 / 3 });
    expect(stats.byStrategy).toEqual([
      { strategy: 'fsrs6', reviews: 2, successRate: 1 },
      { strategy: 'leitner', reviews: 1, successRate: 0 },
    ]);
  });

  it('computes the log loss of FSRS-6 shadow predictions', () => {
    const stats = reviewStats([
      review('2026-11-18T10:00:00', true, { predictedRecall: 0.9 }),
      review('2026-11-18T10:00:00', false, { predictedRecall: 0.2 }),
    ]);
    const expected = -(Math.log(0.9) + Math.log(0.8)) / 2;
    expect(stats.fsrsPredictions).toBe(2);
    expect(stats.fsrsLogLoss).toBeCloseTo(expected);
  });

  it('returns nulls when there is no data', () => {
    expect(reviewStats([])).toMatchObject({ reviews: 0, successRate: null, longGapRecall: null, fsrsLogLoss: null });
  });
});
