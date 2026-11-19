/**
 * `TranslationRepository` adapter for Chrome's built-in Translator API
 * (on-device, desktop only). The model is downloaded the first time and
 * `Translator.create()` needs a user gesture, so call `translate` from a click.
 *
 * Some browsers expose the API but never answer `availability()`; after
 * `availabilityTimeoutMs` it is treated as unavailable so the UI never hangs.
 *
 * @param {{ api?: typeof globalThis.Translator, availabilityTimeoutMs?: number }} [options]  Injectable for tests.
 * @returns {import('../contracts').TranslationRepository}
 */
export function createChromeTranslatorRepository({ api = globalThis.Translator, availabilityTimeoutMs = 5000 } = {}) {
  const translators = new Map();

  const withTimeout = (promise, ms, fallback) =>
    Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), ms))]);

  async function checkAvailability(from, to) {
    if (!api?.availability) return 'unavailable';
    try {
      return await withTimeout(api.availability({ sourceLanguage: from, targetLanguage: to }), availabilityTimeoutMs, 'unavailable');
    } catch {
      return 'unavailable';
    }
  }

  async function getTranslator(from, to, onProgress) {
    const key = `${from}>${to}`;
    if (!translators.has(key)) {
      const created = api
        .create({
          sourceLanguage: from,
          targetLanguage: to,
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => onProgress?.(e.loaded));
          },
        })
        .catch((error) => {
          translators.delete(key);
          throw error;
        });
      translators.set(key, created);
    }
    return translators.get(key);
  }

  return {
    availability: checkAvailability,

    async translate(text, from, to, { onProgress } = {}) {
      const unavailable = { status: 'error', code: 'unavailable', message: 'Translation is not available in this browser.' };
      if (!api?.create) return unavailable;
      if (!translators.has(`${from}>${to}`) && (await checkAvailability(from, to)) === 'unavailable') return unavailable;
      try {
        const translator = await getTranslator(from, to, onProgress);
        return { status: 'ok', text: await translator.translate(text) };
      } catch {
        return { status: 'error', code: 'failed', message: 'Could not translate right now. Try again.' };
      }
    },
  };
}
