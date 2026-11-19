import { emptyPathState } from '../../domain/learningPath';
import { createJsonStore } from '../shared/jsonStore';

export const LEARNING_PATH_STORAGE_KEY = 'dictionary-ui:learning-path:v1';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * `LearningPathRepository` adapter: placement result, words marked as known
 * and words learned per day, in localStorage.
 *
 * @param {{ storage?: Storage, key?: string }} [options]
 * @returns {import('../contracts').LearningPathRepository}
 */
export function createLocalStorageLearningPathRepository({
  storage = globalThis.localStorage,
  key = LEARNING_PATH_STORAGE_KEY,
} = {}) {
  const store = createJsonStore({ storage, key, fallback: emptyPathState, validate: isObject });

  const read = () => {
    const s = store.read();
    const empty = emptyPathState();
    return {
      placement: isObject(s.placement) && typeof s.placement.startRank === 'number' ? s.placement : null,
      known: Array.isArray(s.known) ? s.known.filter((t) => typeof t === 'string') : empty.known,
      learnedByDay: isObject(s.learnedByDay) ? s.learnedByDay : empty.learnedByDay,
      extraByDay: isObject(s.extraByDay) ? s.extraByDay : empty.extraByDay,
    };
  };

  return {
    async get() {
      return read();
    },
    async save(state) {
      store.write(state);
      return read();
    },
  };
}
