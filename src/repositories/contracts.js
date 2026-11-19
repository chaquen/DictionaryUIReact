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

/**
 * Ordered list of useful vocabulary (#19), most frequent first.
 *
 * @typedef {Object} VocabularyListRepository
 * @property {() => Promise<import('../domain/learningPath').VocabularyEntry[]>} list
 * @property {{ name: string, authors: string, license: string, url: string }} source  Shown as attribution.
 */

/**
 * The user's progress along the vocabulary path (#19).
 *
 * @typedef {Object} LearningPathRepository
 * @property {() => Promise<import('../domain/learningPath').LearningPathState>} get
 * @property {(state: import('../domain/learningPath').LearningPathState) => Promise<import('../domain/learningPath').LearningPathState>} save
 */

/**
 * Optional Spanish help (FR-016).
 *
 * @typedef {Object} TranslationRepository
 * @property {(from: string, to: string) => Promise<'available'|'downloadable'|'downloading'|'unavailable'>} availability
 * @property {(text: string, from: string, to: string, options?: { onProgress?: (fraction: number) => void }) => Promise<{ status: 'ok', text: string } | { status: 'error', code: 'unavailable' | 'failed', message: string }>} translate
 */

/**
 * @typedef {Object} WordImage
 * @property {string} url        Thumbnail URL
 * @property {number} width
 * @property {number} height
 * @property {string} title      File name
 * @property {string} author
 * @property {string} license
 * @property {string|null} licenseUrl
 * @property {string} pageUrl    File page with the full attribution
 * @property {'arasaac'|'wikipedia'|'wikidata'|'openverse'} source  Where the picture was found
 * @property {string|null} [caption]  Short explanation of what the picture shows, when the source has one
 * @property {boolean} [checked]  True when the local AI confirmed it shows the meaning
 */

/**
 * Pictures that help recognize a word (#12, FR-006).
 * @typedef {Object} ImageRepository
 * @property {(term: string, options?: { signal?: AbortSignal, partOfSpeech?: 'verb', definition?: string, onPartial?: (images: WordImage[]) => void }) => Promise<WordImage[]>} findImages
 *   Best image first; an empty list when there is no good image. Never rejects (except on abort).
 *   Sources that combine several providers may call `onPartial` with the images found so far.
 *   `partOfSpeech: 'verb'` lets sources look for the action instead of the noun; `definition` lets a
 *   relevance filter keep only pictures that show that meaning.
 */

/**
 * Judges whether a picture shows the meaning of a word (#12, P13), e.g. with
 * the on-device AI of the browser.
 * @typedef {Object} ImageJudgeRepository
 * @property {() => Promise<'available'|'downloadable'|'downloading'|'unavailable'>} availability
 * @property {(options?: { onProgress?: (fraction: number) => void }) => Promise<{ status: 'ok' } | { status: 'error', code: 'unavailable'|'failed' }>} prepare
 *   Downloads the model; call it from a user gesture.
 * @property {(image: WordImage, context: { term: string, definition: string, signal?: AbortSignal }) => Promise<'match'|'no_match'|'unknown'>} judge
 */

const CONTRACTS = {
  WordLookupRepository: ['findByTerm'],
  SavedWordsRepository: ['list', 'save', 'remove'],
  PronunciationRepository: ['findAudioUrl'],
  LearningEventRepository: ['append', 'list', 'exportJson'],
  PreferencesRepository: ['get', 'update'],
  ReviewRepository: ['list', 'saveAll', 'remove'],
  VocabularyListRepository: ['list'],
  LearningPathRepository: ['get', 'save'],
  TranslationRepository: ['availability', 'translate'],
  ImageRepository: ['findImages'],
  ImageJudgeRepository: ['availability', 'prepare', 'judge'],
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
