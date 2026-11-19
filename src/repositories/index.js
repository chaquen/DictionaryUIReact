import { assertImplements } from './contracts';
import { withPronunciation } from './decorators/withPronunciation';
import { createFreeDictionaryWordRepository } from './freeDictionary/FreeDictionaryWordRepository';
import { createLocalStorageLearningPathRepository } from './learningPath/LocalStorageLearningPathRepository';
import { createChromeTranslatorRepository } from './translation/ChromeTranslatorRepository';
import { createArasaacImageRepository } from './images/ArasaacImageRepository';
import { createNgslVocabularyRepository } from './vocabulary/NgslVocabularyRepository';
import { createLocalStorageLearningEventRepository } from './learningEvents/LocalStorageLearningEventRepository';
import { createLocalStoragePreferencesRepository } from './preferences/LocalStoragePreferencesRepository';
import { createLocalStorageReviewRepository } from './review/LocalStorageReviewRepository';
import { createLocalStorageSavedWordsRepository } from './savedWords/LocalStorageSavedWordsRepository';
import { createWikimediaCommonsPronunciationRepository } from './wikimediaCommons/WikimediaCommonsPronunciationRepository';

/**
 * Composition root: the only place that knows which implementations
 * the application uses. To switch dictionary API, create a new adapter
 * that fulfills `WordLookupRepository` and use it here.
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
    savedWords: assertImplements('SavedWordsRepository', createLocalStorageSavedWordsRepository()),
    learningEvents: assertImplements('LearningEventRepository', createLocalStorageLearningEventRepository()),
    preferences: assertImplements('PreferencesRepository', createLocalStoragePreferencesRepository()),
    review: assertImplements('ReviewRepository', createLocalStorageReviewRepository()),
    vocabulary: assertImplements('VocabularyListRepository', createNgslVocabularyRepository()),
    learningPath: assertImplements('LearningPathRepository', createLocalStorageLearningPathRepository()),
    translation: assertImplements('TranslationRepository', createChromeTranslatorRepository()),
    // ARASAAC pictograms (P14). Photo sources (Wikimedia, Openverse, combined and filtered by the local AI with
    // withImageRelevance + createChromeImageJudgeRepository) remain available in images/, ai/ and decorators/.
    images: assertImplements('ImageRepository', createArasaacImageRepository()),
  };
}
