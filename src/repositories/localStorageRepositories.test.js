import { describe, expect, it } from 'vitest';
import { EventType, Idea, createEvent } from '../domain/learningEvent';
import { createReviewCard } from '../domain/scheduling';
import { assertImplements } from './contracts';
import {
  LEARNING_EVENTS_STORAGE_KEY,
  createLocalStorageLearningEventRepository,
} from './learningEvents/LocalStorageLearningEventRepository';
import {
  PREFERENCES_STORAGE_KEY,
  createLocalStoragePreferencesRepository,
} from './preferences/LocalStoragePreferencesRepository';
import {
  REVIEW_CARDS_STORAGE_KEY,
  createLocalStorageReviewRepository,
} from './review/LocalStorageReviewRepository';
import { createMemoryStorage } from './shared/jsonStore';

const NOW = new Date('2026-11-19T10:00:00Z');

describe('LocalStorageLearningEventRepository', () => {
  const event = (term) => createEvent({ idea: Idea.REVIEW, type: EventType.WORD_REVIEWED, term, correct: true }, NOW);

  it('fulfills the contract', () => {
    expect(() =>
      assertImplements('LearningEventRepository', createLocalStorageLearningEventRepository({ storage: createMemoryStorage() })),
    ).not.toThrow();
  });

  it('appends events in order and persists them', async () => {
    const storage = createMemoryStorage();
    const repo = createLocalStorageLearningEventRepository({ storage });
    await repo.append(event('a'));
    await repo.append(event('b'));

    const again = createLocalStorageLearningEventRepository({ storage });
    expect((await again.list()).map((e) => e.term)).toEqual(['a', 'b']);
  });

  it('exports the whole log as JSON', async () => {
    const repo = createLocalStorageLearningEventRepository({ storage: createMemoryStorage() });
    await repo.append(event('a'));
    const exported = JSON.parse(await repo.exportJson());
    expect(exported.events).toHaveLength(1);
    expect(exported.exportedAt).toEqual(expect.any(String));
  });

  it('ignores corrupted or foreign data', async () => {
    const corrupted = createLocalStorageLearningEventRepository({
      storage: createMemoryStorage({ [LEARNING_EVENTS_STORAGE_KEY]: '{oops' }),
    });
    const foreign = createLocalStorageLearningEventRepository({
      storage: createMemoryStorage({ [LEARNING_EVENTS_STORAGE_KEY]: JSON.stringify([{ nope: 1 }, event('a')]) }),
    });
    expect(await corrupted.list()).toEqual([]);
    expect((await foreign.list()).map((e) => e.term)).toEqual(['a']);
  });
});

describe('LocalStoragePreferencesRepository', () => {
  it('fulfills the contract', () => {
    expect(() =>
      assertImplements('PreferencesRepository', createLocalStoragePreferencesRepository({ storage: createMemoryStorage() })),
    ).not.toThrow();
  });

  it('enables every idea and uses FSRS-6 by default', async () => {
    const repo = createLocalStoragePreferencesRepository({ storage: createMemoryStorage() });
    expect(await repo.get()).toEqual({
      flags: { learn: true, review: true, gamification: true, images: true, translation: true },
      schedulingStrategy: 'fsrs6',
      newWordsPerDay: 10,
      helpLanguage: null,
    });
  });

  it('updates flags one by one and the scheduling strategy', async () => {
    const storage = createMemoryStorage();
    const repo = createLocalStoragePreferencesRepository({ storage });
    await repo.update({ flags: { gamification: false } });
    await repo.update({ schedulingStrategy: 'leitner' });

    const again = createLocalStoragePreferencesRepository({ storage });
    expect(await again.get()).toMatchObject({
      flags: { learn: true, review: true, gamification: false, translation: true },
      schedulingStrategy: 'leitner',
    });
  });

  it('falls back to defaults with corrupted data', async () => {
    const repo = createLocalStoragePreferencesRepository({
      storage: createMemoryStorage({ [PREFERENCES_STORAGE_KEY]: '[1,2]' }),
    });
    expect((await repo.get()).schedulingStrategy).toBe('fsrs6');
  });
});

describe('LocalStorageReviewRepository', () => {
  it('fulfills the contract', () => {
    expect(() =>
      assertImplements('ReviewRepository', createLocalStorageReviewRepository({ storage: createMemoryStorage() })),
    ).not.toThrow();
  });

  it('inserts and replaces cards by term, and removes them', async () => {
    const repo = createLocalStorageReviewRepository({ storage: createMemoryStorage() });
    const run = createReviewCard('run', 'fsrs6', NOW);
    await repo.saveAll([run, createReviewCard('bank', 'leitner', NOW)]);
    await repo.saveAll([{ ...run, reviews: 3 }]);

    const cards = await repo.list();
    expect(cards.map((c) => [c.term, c.reviews])).toEqual([['bank', 0], ['run', 3]]);

    await repo.remove(' RUN ');
    expect((await repo.list()).map((c) => c.term)).toEqual(['bank']);
  });

  it('ignores invalid cards', async () => {
    const repo = createLocalStorageReviewRepository({
      storage: createMemoryStorage({
        [REVIEW_CARDS_STORAGE_KEY]: JSON.stringify([{ term: 'x' }, createReviewCard('ok', 'fsrs6', NOW)]),
      }),
    });
    expect((await repo.list()).map((c) => c.term)).toEqual(['ok']);
  });
});
