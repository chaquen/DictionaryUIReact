import { assertImplements } from './contracts';
import { withPronunciation } from './decorators/withPronunciation';
import { createFreeDictionaryWordRepository } from './freeDictionary/FreeDictionaryWordRepository';
import { createLocalStorageSavedWordsRepository } from './savedWords/LocalStorageSavedWordsRepository';
import { createWikimediaCommonsPronunciationRepository } from './wikimediaCommons/WikimediaCommonsPronunciationRepository';

/**
 * Composition root: the only place that knows which implementations
 * the application uses. To switch dictionary API, create a new adapter
 * that fulfills `WordLookupRepository` and use it here.
 *
 * @returns {{ wordLookup: import('./contracts').WordLookupRepository,
 *             savedWords: import('./contracts').SavedWordsRepository }}
 */
export function createRepositories() {
  const dictionary = assertImplements(
    'WordLookupRepository',
    createFreeDictionaryWordRepository({
      baseUrl: import.meta.env.VITE_DICTIONARY_API_URL || undefined,
    }),
  );
  const pronunciation = assertImplements(
    'PronunciationRepository',
    createWikimediaCommonsPronunciationRepository(),
  );

  return {
    wordLookup: withPronunciation(dictionary, pronunciation),
    savedWords: assertImplements(
      'SavedWordsRepository',
      createLocalStorageSavedWordsRepository(),
    ),
  };
}
