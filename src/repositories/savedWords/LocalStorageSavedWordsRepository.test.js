import { describe, expect, it } from 'vitest';
import { buildWord } from '../../test/fakes';
import { assertImplements } from '../contracts';
import {
  SAVED_WORDS_STORAGE_KEY,
  createLocalStorageSavedWordsRepository,
} from './LocalStorageSavedWordsRepository';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

describe('LocalStorageSavedWordsRepository', () => {
  it('fulfills the SavedWordsRepository contract', () => {
    expect(() =>
      assertImplements('SavedWordsRepository', createLocalStorageSavedWordsRepository({ storage: memoryStorage() })),
    ).not.toThrow();
  });

  it('starts empty', async () => {
    const repo = createLocalStorageSavedWordsRepository({ storage: memoryStorage() });
    expect(await repo.list()).toEqual([]);
  });

  it('saves words most recent first and replaces duplicates', async () => {
    const repo = createLocalStorageSavedWordsRepository({ storage: memoryStorage() });

    await repo.save(buildWord({ word: 'hello' }));
    await repo.save(buildWord({ word: 'bank' }));
    await repo.save(buildWord({ word: 'hello', phonetic: '/new/' }));

    const words = await repo.list();
    expect(words.map((w) => w.word)).toEqual(['hello', 'bank']);
    expect(words[0].phonetic).toBe('/new/');
  });

  it('removes words ignoring case and spaces', async () => {
    const repo = createLocalStorageSavedWordsRepository({ storage: memoryStorage() });
    await repo.save(buildWord({ word: 'hello' }));

    await repo.remove(' HELLO ');

    expect(await repo.list()).toEqual([]);
  });

  it('persists between instances', async () => {
    const storage = memoryStorage();
    await createLocalStorageSavedWordsRepository({ storage }).save(buildWord());

    const words = await createLocalStorageSavedWordsRepository({ storage }).list();
    expect(words).toHaveLength(1);
  });

  it('ignores corrupted or foreign data', async () => {
    const corrupted = createLocalStorageSavedWordsRepository({
      storage: memoryStorage({ [SAVED_WORDS_STORAGE_KEY]: '{not json' }),
    });
    const foreign = createLocalStorageSavedWordsRepository({
      storage: memoryStorage({ [SAVED_WORDS_STORAGE_KEY]: JSON.stringify([{ code: 200 }, buildWord()]) }),
    });

    expect(await corrupted.list()).toEqual([]);
    expect((await foreign.list()).map((w) => w.word)).toEqual(['hello']);
  });
});
