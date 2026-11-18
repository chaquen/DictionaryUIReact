import { found, normalizeTerm, notFound } from '../domain/word';

/** Builds a domain `Word` with sensible defaults for tests. */
export function buildWord(overrides = {}) {
  return {
    word: 'hello',
    phonetic: '/həˈloʊ/',
    audioUrl: null,
    meanings: [
      {
        partOfSpeech: 'interjection',
        definitions: [
          { text: 'A greeting said when meeting someone.', example: 'Hello, everyone.' },
          { text: 'A greeting used when answering the telephone.', example: null },
        ],
        synonyms: ['hi'],
        antonyms: ['goodbye'],
      },
    ],
    sourceUrls: [],
    ...overrides,
  };
}

/** In-memory `WordLookupRepository` for UI tests (no network). */
export function createFakeWordLookup(words = [buildWord()]) {
  return {
    async findByTerm(term) {
      const match = words.find((w) => w.word === normalizeTerm(term));
      return match ? found(match) : notFound(`No definitions found for "${normalizeTerm(term)}".`);
    },
  };
}

/** In-memory `SavedWordsRepository` for UI tests. */
export function createFakeSavedWords(initial = []) {
  let words = [...initial];
  return {
    async list() {
      return [...words];
    },
    async save(word) {
      words = [word, ...words.filter((w) => w.word !== word.word)];
    },
    async remove(term) {
      words = words.filter((w) => w.word !== term);
    },
  };
}
