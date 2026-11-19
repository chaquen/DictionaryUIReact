/**
 * Small helper for adapters that keep JSON in a Web Storage (localStorage).
 * Corrupted or foreign data is ignored instead of breaking the app.
 *
 * @template T
 * @param {{ storage: Storage, key: string, fallback: () => T, validate?: (value: unknown) => boolean }} options
 */
export function createJsonStore({ storage, key, fallback, validate = () => true }) {
  return {
    read() {
      try {
        const raw = storage.getItem(key);
        if (raw === null) return fallback();
        const parsed = JSON.parse(raw);
        return validate(parsed) ? parsed : fallback();
      } catch {
        return fallback();
      }
    },
    write(value) {
      storage.setItem(key, JSON.stringify(value));
    },
  };
}

/** In-memory Storage for tests and environments without localStorage. */
export function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
}
