import { describe, expect, it, vi } from 'vitest';
import { assertImplements } from './contracts';
import {
  LEARNING_PATH_STORAGE_KEY,
  createLocalStorageLearningPathRepository,
} from './learningPath/LocalStorageLearningPathRepository';
import { createMemoryStorage } from './shared/jsonStore';
import { createChromeTranslatorRepository } from './translation/ChromeTranslatorRepository';
import { createNgslVocabularyRepository } from './vocabulary/NgslVocabularyRepository';

describe('NgslVocabularyRepository', () => {
  it('fulfills the contract', () => {
    expect(() => assertImplements('VocabularyListRepository', createNgslVocabularyRepository())).not.toThrow();
  });

  it('loads the real NGSL 1.2 file ordered by frequency', async () => {
    const words = await createNgslVocabularyRepository().list();
    expect(words).toHaveLength(2809);
    expect(words[0]).toMatchObject({ term: 'the', rank: 1 });
    expect(words.every((w, i) => i === 0 || w.rank >= words[i - 1].rank)).toBe(true);
    expect(words.filter((w) => w.definition).length).toBeGreaterThan(2800);
  });

  it('loads the file only once', async () => {
    const load = vi.fn().mockResolvedValue({ default: { words: [['b', 2, 5, 'x'], ['a', 1, 9, 'y']] } });
    const repo = createNgslVocabularyRepository({ load });
    await repo.list();
    expect((await repo.list()).map((w) => w.term)).toEqual(['a', 'b']);
    expect(load).toHaveBeenCalledTimes(1);
  });
});

describe('LocalStorageLearningPathRepository', () => {
  it('fulfills the contract', () => {
    expect(() =>
      assertImplements('LearningPathRepository', createLocalStorageLearningPathRepository({ storage: createMemoryStorage() })),
    ).not.toThrow();
  });

  it('starts empty and persists the state', async () => {
    const storage = createMemoryStorage();
    const repo = createLocalStorageLearningPathRepository({ storage });
    expect(await repo.get()).toEqual({ placement: null, known: [], learnedByDay: {}, extraByDay: {} });

    const state = { placement: { startRank: 301, completedAt: 'x' }, known: ['cat'], learnedByDay: { d: ['dog'] }, extraByDay: {} };
    await repo.save(state);
    expect(await createLocalStorageLearningPathRepository({ storage }).get()).toEqual(state);
  });

  it('repairs corrupted data', async () => {
    const repo = createLocalStorageLearningPathRepository({
      storage: createMemoryStorage({ [LEARNING_PATH_STORAGE_KEY]: JSON.stringify({ placement: 'x', known: [1, 'ok'] }) }),
    });
    expect(await repo.get()).toEqual({ placement: null, known: ['ok'], learnedByDay: {}, extraByDay: {} });
  });
});

describe('ChromeTranslatorRepository', () => {
  function fakeTranslatorApi({ availability = 'available', fail = false } = {}) {
    return {
      availability: vi.fn().mockResolvedValue(availability),
      create: vi.fn(async ({ monitor }) => {
        const target = new EventTarget();
        monitor?.(target);
        target.dispatchEvent(Object.assign(new Event('downloadprogress'), { loaded: 0.5 }));
        if (fail) throw new Error('NotAllowedError');
        return { translate: vi.fn(async (text) => `ES(${text})`) };
      }),
    };
  }

  it('fulfills the contract', () => {
    expect(() => assertImplements('TranslationRepository', createChromeTranslatorRepository({ api: undefined }))).not.toThrow();
  });

  it('translates and reuses the translator for the same pair', async () => {
    const api = fakeTranslatorApi();
    const onProgress = vi.fn();
    const repo = createChromeTranslatorRepository({ api });

    expect(await repo.availability('en', 'es')).toBe('available');
    expect(await repo.translate('dog', 'en', 'es', { onProgress })).toEqual({ status: 'ok', text: 'ES(dog)' });
    await repo.translate('cat', 'en', 'es');

    expect(api.create).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it('treats an availability check that never answers as unavailable', async () => {
    const api = { availability: () => new Promise(() => {}), create: vi.fn() };
    const repo = createChromeTranslatorRepository({ api, availabilityTimeoutMs: 20 });

    expect(await repo.availability('en', 'es')).toBe('unavailable');
    expect(await repo.translate('x', 'en', 'es')).toEqual({ status: 'error', code: 'unavailable', message: 'Translation is not available in this browser.' });
    expect(api.create).not.toHaveBeenCalled();
  });

  it('reports unavailable without the API and an error when creation fails', async () => {
    expect(await createChromeTranslatorRepository({ api: undefined }).availability('en', 'es')).toBe('unavailable');
    expect((await createChromeTranslatorRepository({ api: undefined }).translate('x', 'en', 'es')).status).toBe('error');

    const failing = createChromeTranslatorRepository({ api: fakeTranslatorApi({ fail: true }) });
    expect((await failing.translate('x', 'en', 'es')).status).toBe('error');
  });
});
