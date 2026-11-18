import { normalizeTerm } from '../../domain/word';

export const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php';

/** Accent preference: first match wins. */
export const DEFAULT_ACCENTS = ['us', 'uk', 'au'];

const fileTitle = (accent, term) => `File:En-${accent}-${term}.ogg`;
const sameTitle = (a, b) => a.replace(/_/g, ' ').toLowerCase() === b.replace(/_/g, ' ').toLowerCase();

/** Prefers the MP3 transcode (plays everywhere), then the original Ogg file. */
function pickSource(page) {
  const info = page?.videoinfo?.[0];
  if (!info) return null;
  const mp3 = (info.derivatives ?? []).find((d) => d.type?.startsWith('audio/mpeg'));
  return mp3?.src ?? info.url ?? null;
}

/**
 * `PronunciationRepository` adapter for Wikimedia Commons, which hosts human
 * recordings named "En-us-<word>.ogg", "En-uk-<word>.ogg", ...
 * (the same recordings Wiktionary uses).
 *
 * @param {Object} [options]
 * @param {string} [options.endpoint]
 * @param {string[]} [options.accents]
 * @param {typeof fetch} [options.fetchFn]
 * @returns {import('../contracts').PronunciationRepository}
 */
export function createWikimediaCommonsPronunciationRepository({
  endpoint = COMMONS_API_URL,
  accents = DEFAULT_ACCENTS,
  fetchFn = (...args) => globalThis.fetch(...args),
} = {}) {
  const cache = new Map();

  async function fetchAudioUrl(term, signal) {
    const titles = accents.map((accent) => fileTitle(accent, term));
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      origin: '*',
      prop: 'videoinfo',
      viprop: 'url|derivatives',
      titles: titles.join('|'),
    });
    const response = await fetchFn(`${endpoint}?${params}`, { signal });
    if (!response.ok) return null;
    const pages = (await response.json())?.query?.pages ?? [];

    for (const title of titles) {
      const page = pages.find((p) => !p.missing && p.title && sameTitle(p.title, title));
      const source = pickSource(page);
      if (source) return source;
    }
    return null;
  }

  return {
    async findAudioUrl(term, { signal } = {}) {
      const normalized = normalizeTerm(term);
      if (!normalized) return null;
      if (cache.has(normalized)) return cache.get(normalized);
      try {
        const url = await fetchAudioUrl(normalized, signal);
        cache.set(normalized, url);
        return url;
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        return null; // A missing recording must never break a search.
      }
    },
  };
}
