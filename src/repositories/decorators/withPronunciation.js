import { LookupStatus } from '../../domain/word';

/**
 * Decorator: enriches any `WordLookupRepository` with human recordings from a
 * `PronunciationRepository`. Both requests run in parallel. When no recording
 * is found, the word keeps the audio its dictionary provided (if any).
 *
 * @param {import('../contracts').WordLookupRepository} wordLookup
 * @param {import('../contracts').PronunciationRepository} pronunciation
 * @returns {import('../contracts').WordLookupRepository}
 */
export function withPronunciation(wordLookup, pronunciation) {
  return {
    async findByTerm(term, options = {}) {
      const [result, audioUrl] = await Promise.all([
        wordLookup.findByTerm(term, options),
        pronunciation.findAudioUrl(term, options).catch((error) => {
          if (error?.name === 'AbortError') throw error;
          return null;
        }),
      ]);
      if (result.status !== LookupStatus.FOUND || !audioUrl) return result;
      return { ...result, word: { ...result.word, audioUrl } };
    },
  };
}
