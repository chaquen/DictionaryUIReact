import { describe, expect, it } from 'vitest';
import {
  coverage,
  coveredTerms,
  emptyPathState,
  estimateStart,
  isMastered,
  nextNewWords,
  placementSample,
  remainingToday,
} from './learningPath';

const NOW = new Date('2026-11-19T10:00:00');

// 3000 synthetic words: rank n, frequency decreasing with rank.
const LIST = Array.from({ length: 3000 }, (_, i) => ({
  term: `w${i + 1}`,
  rank: i + 1,
  perMillion: 1000 / (i + 1),
  definition: `definition ${i + 1}`,
}));

describe('placement', () => {
  it('samples 5 words spread across each frequency band', () => {
    const sample = placementSample(LIST);
    expect(sample).toHaveLength(6);
    expect(sample[0]).toMatchObject({ from: 101, to: 300 });
    expect(sample[0].words).toHaveLength(5);
    expect(sample[0].words.every((w) => w.rank >= 101 && w.rank <= 300)).toBe(true);
    expect(new Set(sample.flatMap((b) => b.words.map((w) => w.term))).size).toBe(30);
  });

  it('starts at the first band where the user knows less than 60 %', () => {
    const sample = placementSample(LIST);
    const known = new Set([...sample[0].words, ...sample[1].words, ...sample[2].words.slice(0, 2)].map((w) => w.term));
    expect(estimateStart(sample, known)).toBe(701);
    expect(estimateStart(sample, new Set())).toBe(101);
  });

  it('starts after the last band when the user knows everything', () => {
    const sample = placementSample(LIST);
    expect(estimateStart(sample, new Set(sample.flatMap((b) => b.words.map((w) => w.term))))).toBe(2810);
  });
});

describe('new words', () => {
  it('proposes the most frequent unknown and unsaved words from the start rank', () => {
    const state = { ...emptyPathState(), placement: { startRank: 500, completedAt: NOW.toISOString() }, known: ['w501'] };
    expect(nextNewWords(LIST, state, ['W502'], 3).map((w) => w.rank)).toEqual([500, 503, 504]);
  });

  it('never proposes the 100 most frequent words', () => {
    expect(nextNewWords(LIST, emptyPathState(), [], 1)[0].rank).toBe(101);
  });

  it('applies the daily quota plus extra words asked for today', () => {
    const state = { ...emptyPathState(), learnedByDay: { '2026-11-19': ['a', 'b', 'c'] }, extraByDay: { '2026-11-19': 5 } };
    expect(remainingToday(state, 10, NOW)).toBe(12);
    expect(remainingToday({ ...state, extraByDay: {} }, 2, NOW)).toBe(0);
  });
});

describe('coverage', () => {
  it('counts the top 100, the words below the start rank, known words and mastered cards', () => {
    const state = { ...emptyPathState(), placement: { startRank: 201, completedAt: '' }, known: ['w900'] };
    const cards = [
      { term: 'w1500', fsrsShadow: { stability: 30 } },
      { term: 'w1600', fsrsShadow: { stability: 3 } },
    ];
    const covered = coveredTerms(LIST, state, cards);

    expect(covered.has('w200')).toBe(true);
    expect(covered.has('w201')).toBe(false);
    expect(covered.has('w900')).toBe(true);
    expect(covered.has('w1500')).toBe(true);
    expect(covered.has('w1600')).toBe(false);
    expect(covered.size).toBe(202);
  });

  it('is the share of text tokens represented by covered words', () => {
    const list = [
      { term: 'a', rank: 1, perMillion: 600_000, definition: '' },
      { term: 'b', rank: 2, perMillion: 250_000, definition: '' },
    ];
    expect(coverage(list, new Set(['a']))).toBeCloseTo(0.6);
    expect(coverage(list, new Set(['a', 'b']))).toBeCloseTo(0.85);
    expect(coverage([], new Set())).toBe(0);
  });

  it('a word is mastered with an FSRS-6 stability of 21 days or more', () => {
    expect(isMastered({ fsrsShadow: { stability: 21 } })).toBe(true);
    expect(isMastered({ fsrsShadow: { stability: 20.9 } })).toBe(false);
    expect(isMastered({})).toBe(false);
  });
});
