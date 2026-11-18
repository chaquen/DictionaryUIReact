/**
 * Domain model of the application.
 *
 * Components only work with these shapes. Each repository adapter is
 * responsible for translating its data source (an API, localStorage, ...)
 * into them, so the data source can change without touching the UI.
 */

/**
 * @typedef {Object} Definition
 * @property {string} text
 * @property {string|null} example
 */

/**
 * @typedef {Object} Meaning
 * @property {string} partOfSpeech  e.g. "noun", "verb"
 * @property {Definition[]} definitions
 * @property {string[]} synonyms
 * @property {string[]} antonyms
 */

/**
 * @typedef {Object} Word
 * @property {string} word
 * @property {string|null} phonetic  IPA transcription, e.g. "/bæŋk/"
 * @property {string|null} audioUrl  Recorded pronunciation, if available
 * @property {Meaning[]} meanings
 * @property {string[]} sourceUrls
 */

/**
 * Result of looking a word up. Repositories never throw for expected
 * situations; they return one of these outcomes instead.
 *
 * @typedef {{ status: 'found', word: Word }
 *   | { status: 'not_found', message: string }
 *   | { status: 'error', message: string }} LookupResult
 */

export const LookupStatus = Object.freeze({
  FOUND: 'found',
  NOT_FOUND: 'not_found',
  ERROR: 'error',
});

/** @param {Word} word */
export const found = (word) => ({ status: LookupStatus.FOUND, word });
/** @param {string} message */
export const notFound = (message) => ({ status: LookupStatus.NOT_FOUND, message });
/** @param {string} message */
export const lookupError = (message) => ({ status: LookupStatus.ERROR, message });

/** Normalizes a search term so it can be used as an identifier. */
export function normalizeTerm(term) {
  return String(term ?? '').trim().toLowerCase();
}

/** Total number of definitions across every meaning of a word. */
export function countDefinitions(word) {
  return word.meanings.reduce((total, m) => total + m.definitions.length, 0);
}

/** First definition of a word, or null if it has none. */
export function firstDefinition(word) {
  const meaning = word.meanings.find((m) => m.definitions.length > 0);
  return meaning ? meaning.definitions[0].text : null;
}
