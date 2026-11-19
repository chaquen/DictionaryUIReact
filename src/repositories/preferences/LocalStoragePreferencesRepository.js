import { DEFAULT_FLAGS } from '../../domain/ideas';
import { DEFAULT_STRATEGY_ID } from '../../domain/scheduling';
import { createJsonStore } from '../shared/jsonStore';

export const PREFERENCES_STORAGE_KEY = 'dictionary-ui:preferences:v1';

/**
 * @typedef {{ flags: Record<string, boolean>, schedulingStrategy: string, newWordsPerDay: number, helpLanguage: string|null }} Preferences
 * `helpLanguage` null means the app's default help language.
 */

export const DEFAULT_NEW_WORDS_PER_DAY = 10;

export const defaultPreferences = () => ({
  flags: { ...DEFAULT_FLAGS },
  schedulingStrategy: DEFAULT_STRATEGY_ID,
  newWordsPerDay: DEFAULT_NEW_WORDS_PER_DAY,
  helpLanguage: null,
});

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * `PreferencesRepository` adapter: idea flags (FR-010), the active
 * scheduling algorithm, new words per day and the help language (FR-017). Unknown or missing values fall back to defaults.
 *
 * @param {{ storage?: Storage, key?: string }} [options]
 * @returns {import('../contracts').PreferencesRepository}
 */
export function createLocalStoragePreferencesRepository({
  storage = globalThis.localStorage,
  key = PREFERENCES_STORAGE_KEY,
} = {}) {
  const store = createJsonStore({ storage, key, fallback: defaultPreferences, validate: isObject });

  const read = () => {
    const stored = store.read();
    const defaults = defaultPreferences();
    return {
      flags: { ...defaults.flags, ...(isObject(stored.flags) ? stored.flags : {}) },
      schedulingStrategy:
        typeof stored.schedulingStrategy === 'string' ? stored.schedulingStrategy : defaults.schedulingStrategy,
      newWordsPerDay:
        Number.isInteger(stored.newWordsPerDay) && stored.newWordsPerDay > 0
          ? stored.newWordsPerDay
          : defaults.newWordsPerDay,
      helpLanguage: typeof stored.helpLanguage === 'string' ? stored.helpLanguage : defaults.helpLanguage,
    };
  };

  return {
    async get() {
      return read();
    },
    async update(changes) {
      const current = read();
      const next = {
        ...current,
        ...changes,
        flags: { ...current.flags, ...(changes.flags ?? {}) },
      };
      store.write(next);
      return next;
    },
  };
}
