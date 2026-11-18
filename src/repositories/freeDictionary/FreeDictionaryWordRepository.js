import { found, lookupError, normalizeTerm, notFound } from '../../domain/word';
import { mapEntriesToWord } from './freeDictionaryMapper';

export const FREE_DICTIONARY_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/**
 * `WordLookupRepository` adapter for the Free Dictionary API.
 *
 * @param {Object} [options]
 * @param {string} [options.baseUrl]
 * @param {typeof fetch} [options.fetchFn]  Injectable for tests.
 * @returns {import('../contracts').WordLookupRepository}
 */
export function createFreeDictionaryWordRepository({
  baseUrl = FREE_DICTIONARY_BASE_URL,
  fetchFn = (...args) => globalThis.fetch(...args),
} = {}) {
  return {
    async findByTerm(term, { signal } = {}) {
      const normalized = normalizeTerm(term);
      if (!normalized) return notFound('Write a word to search.');

      let response;
      try {
        response = await fetchFn(`${baseUrl}/${encodeURIComponent(normalized)}`, { signal });
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        return lookupError('Could not reach the dictionary. Check your connection and try again.');
      }

      if (response.status === 404) {
        return notFound(`No definitions found for "${normalized}".`);
      }
      if (!response.ok) {
        return lookupError(`The dictionary answered with an error (${response.status}). Try again later.`);
      }

      try {
        return found(mapEntriesToWord(await response.json()));
      } catch {
        return lookupError('The dictionary returned an unexpected response.');
      }
    },
  };
}
