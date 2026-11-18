import { normalizeTerm } from '../../domain/word';

export const SAVED_WORDS_STORAGE_KEY = 'dictionary-ui:saved-words:v1';

const isWord = (value) =>
  value && typeof value.word === 'string' && Array.isArray(value.meanings);

/**
 * `SavedWordsRepository` adapter backed by the browser's localStorage.
 * It stores domain `Word` objects (never raw API payloads), so the
 * collection survives a change of dictionary API.
 *
 * @param {Object} [options]
 * @param {Storage} [options.storage]  Injectable for tests.
 * @param {string} [options.key]
 * @returns {import('../contracts').SavedWordsRepository}
 */
export function createLocalStorageSavedWordsRepository({
  storage = globalThis.localStorage,
  key = SAVED_WORDS_STORAGE_KEY,
} = {}) {
  function read() {
    try {
      const parsed = JSON.parse(storage.getItem(key) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter(isWord) : [];
    } catch {
      return [];
    }
  }

  function write(words) {
    storage.setItem(key, JSON.stringify(words));
  }

  const sameTerm = (term) => (w) => normalizeTerm(w.word) === normalizeTerm(term);

  return {
    async list() {
      return read();
    },
    async save(word) {
      write([word, ...read().filter((w) => !sameTerm(word.word)(w))]);
    },
    async remove(term) {
      write(read().filter((w) => !sameTerm(term)(w)));
    },
  };
}
