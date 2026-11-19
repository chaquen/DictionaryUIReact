/** Session options; `availability()` must be called with the same ones. */
export const IMAGE_JUDGE_OPTIONS = Object.freeze({
  expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'image' }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
});

const withTimeout = (promise, ms, fallback) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), ms))]);

/** Step 1 (with the picture): what the picture is mainly about. */
export const SUBJECT_PROMPT = 'In at most 12 words, what is the main subject of this picture, the thing that fills most of it?';

/**
 * Step 2 (text only): does that subject show the meaning? Asking directly
 * with the picture approved details ("a tiny person standing on a mountain")
 * and a boolean format answered "no" to everything; tested with Gemini Nano
 * in Chrome 157.
 */
export const verdictPrompt = ({ subject, term, definition }) =>
  `Main subject: "${subject}". Word: "${term}" (${definition}). Is the main subject a good example of this word? ` +
  'If the main subject is text, a page, a sign, a logo or a chart, reply no. Reply with one word: yes or no.';

/**
 * `ImageJudgeRepository` adapter (#12, P13) for Chrome's built-in AI
 * (Gemini Nano through the Prompt API, multimodal, on the device): says
 * whether a picture shows the meaning of a word, in two steps: the model
 * describes the main subject of the picture, then says whether that subject
 * is an example of the word. Nothing leaves the device.
 *
 * The model is downloaded once; `prepare()` starts the download and must be
 * called from a click. Verdicts are cached per word and picture.
 *
 * @param {Object} [options]
 * @param {typeof globalThis.LanguageModel} [options.api]  Injectable for tests.
 * @param {typeof fetch} [options.fetchFn]  Downloads the picture to show it to the model.
 * @param {number} [options.timeoutMs]  Per picture; slower answers count as 'unknown'.
 * @returns {import('../contracts').ImageJudgeRepository}
 */
export function createChromeImageJudgeRepository({
  api = globalThis.LanguageModel,
  fetchFn = (...args) => globalThis.fetch(...args),
  timeoutMs = 20000,
} = {}) {
  let base = null;
  const verdicts = new Map();

  async function availability() {
    if (!api?.availability) return 'unavailable';
    try {
      return await withTimeout(api.availability(IMAGE_JUDGE_OPTIONS), 5000, 'unavailable');
    } catch {
      return 'unavailable';
    }
  }

  function session(monitor) {
    if (!base) {
      base = api.create({ ...IMAGE_JUDGE_OPTIONS, ...(monitor ? { monitor } : {}) }).catch((error) => {
        base = null;
        throw error;
      });
    }
    return base;
  }

  async function ask(image, { term, definition, signal }) {
    const response = await fetchFn(image.url, { signal });
    if (!response.ok) return 'unknown';
    const picture = await response.blob();
    const fork = await (await session()).clone({ signal });
    try {
      const subject = await fork.prompt(
        [{ role: 'user', content: [{ type: 'text', value: SUBJECT_PROMPT }, { type: 'image', value: picture }] }],
        { signal },
      );
      const answer = await fork.prompt(verdictPrompt({ subject: subject.trim(), term, definition }), { signal });
      if (/^\W*yes/i.test(answer)) return 'match';
      if (/^\W*no/i.test(answer)) return 'no_match';
      return 'unknown';
    } finally {
      fork.destroy();
    }
  }

  return {
    availability,

    /** Downloads the model (call from a click). */
    async prepare({ onProgress } = {}) {
      if (!api?.create) return { status: 'error', code: 'unavailable' };
      try {
        await session((m) => m.addEventListener('downloadprogress', (e) => onProgress?.(e.loaded)));
        return { status: 'ok' };
      } catch {
        return { status: 'error', code: 'failed' };
      }
    },

    async judge(image, { term, definition, signal } = {}) {
      const key = `${term}|${definition}|${image.url}`;
      if (verdicts.has(key)) return verdicts.get(key);
      if ((await availability()) !== 'available') return 'unknown';
      try {
        const verdict = await withTimeout(ask(image, { term, definition, signal }), timeoutMs, 'unknown');
        if (verdict !== 'unknown') verdicts.set(key, verdict);
        return verdict;
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        return 'unknown'; // E.g. the picture cannot be downloaded (CORS) or the model failed.
      }
    },
  };
}
