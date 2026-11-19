import { isLearningEvent } from '../../domain/learningEvent';
import { createJsonStore } from '../shared/jsonStore';

export const LEARNING_EVENTS_STORAGE_KEY = 'dictionary-ui:learning-events:v1';

/**
 * `LearningEventRepository` adapter: append-only event log in localStorage.
 *
 * @param {{ storage?: Storage, key?: string }} [options]
 * @returns {import('../contracts').LearningEventRepository}
 */
export function createLocalStorageLearningEventRepository({
  storage = globalThis.localStorage,
  key = LEARNING_EVENTS_STORAGE_KEY,
} = {}) {
  const store = createJsonStore({ storage, key, fallback: () => [], validate: Array.isArray });
  const read = () => store.read().filter(isLearningEvent);

  return {
    async append(event) {
      store.write([...read(), event]);
    },
    async list() {
      return read();
    },
    async exportJson() {
      return JSON.stringify({ exportedAt: new Date().toISOString(), events: read() }, null, 2);
    },
  };
}
