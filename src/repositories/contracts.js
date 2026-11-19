/**
 * Repository contracts (ports).
 *
 * The UI depends only on these contracts. To use another dictionary API or
 * another storage, write a new adapter that fulfills the contract and wire
 * it in `src/repositories/index.js`. No component has to change.
 *
 * @typedef {import('../domain/word').Word} Word
 * @typedef {import('../domain/word').LookupResult} LookupResult
 */

/**
 * Looks words up in a dictionary source.
 *
 * @typedef {Object} WordLookupRepository
 * @property {(term: string, options?: { signal?: AbortSignal }) => Promise<LookupResult>} findByTerm
 *   Resolves with an outcome; never rejects for "not found" or network errors.
 */

/**
 * Stores the words the user decided to keep.
 * Methods are async so a remote implementation can replace the local one.
 *
 * @typedef {Object} SavedWordsRepository
 * @property {() => Promise<Word[]>} list         Most recently saved first.
 * @property {(word: Word) => Promise<void>} save  Inserts or replaces by `word.word`.
 * @property {(term: string) => Promise<void>} remove
 */

/**
 * Finds a recorded (human) pronunciation for a word.
 *
 * @typedef {Object} PronunciationRepository
 * @property {(term: string, options?: { signal?: AbortSignal }) => Promise<string|null>} findAudioUrl
 *   Resolves with a playable URL, or null when there is no recording.
 */

/**
 * Append-only log of learning events (FR-009). Source of metrics and game mechanics.
 *
 * @typedef {Object} LearningEventRepository
 * @property {(event: import('../domain/learningEvent').LearningEvent) => Promise<void>} append
 * @property {() => Promise<import('../domain/learningEvent').LearningEvent[]>} list  Oldest first.
 * @property {() => Promise<string>} exportJson  The whole log as a JSON document.
 */

/**
 * User preferences: idea flags (FR-010) and the active scheduling algorithm.
 *
 * @typedef {Object} PreferencesRepository
 * @property {() => Promise<{ flags: Record<string, boolean>, schedulingStrategy: string }>} get
 * @property {(changes: Object) => Promise<{ flags: Record<string, boolean>, schedulingStrategy: string }>} update
 */

/**
 * Spaced-repetition cards (#1). Cards are produced by a SchedulingStrategy.
 *
 * @typedef {Object} ReviewRepository
 * @property {() => Promise<import('../domain/scheduling/contract').ReviewCard[]>} list
 * @property {(cards: import('../domain/scheduling/contract').ReviewCard[]) => Promise<void>} saveAll  Inserts or replaces by term.
 * @property {(term: string) => Promise<void>} remove
 */

const CONTRACTS = {
  WordLookupRepository: ['findByTerm'],
  SavedWordsRepository: ['list', 'save', 'remove'],
  PronunciationRepository: ['findAudioUrl'],
  LearningEventRepository: ['append', 'list', 'exportJson'],
  PreferencesRepository: ['get', 'update'],
  ReviewRepository: ['list', 'saveAll', 'remove'],
};

/**
 * Fails fast when an adapter does not fulfill its contract.
 * @template T
 * @param {keyof typeof CONTRACTS} contract
 * @param {T} implementation
 * @returns {T}
 */
export function assertImplements(contract, implementation) {
  const missing = CONTRACTS[contract].filter(
    (method) => typeof implementation?.[method] !== 'function',
  );
  if (missing.length > 0) {
    throw new TypeError(`${contract} is missing: ${missing.join(', ')}`);
  }
  return implementation;
}
