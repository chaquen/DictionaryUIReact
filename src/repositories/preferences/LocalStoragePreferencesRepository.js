import { DEFAULT_FLAGS } from '../../domain/ideas';
import { DEFAULT_STRATEGY_ID } from '../../domain/scheduling';
import { createJsonStore } from '../shared/jsonStore';

export const PREFERENCES_STORAGE_KEY = 'dictionary-ui:preferences:v1';

/**
 * @typedef {{ flags: Record<string, boolean>, schedulingStrategy: string }} Preferences
 */

export const defaultPreferences = () => ({
  flags: { ...DEFAULT_FLAGS },
  schedulingStrategy: DEFAULT_STRATEGY_ID,
});

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * `PreferencesRepository` adapter: idea flags (FR-010) and the active
 * scheduling algorithm. Unknown or missing values fall back to defaults.
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
