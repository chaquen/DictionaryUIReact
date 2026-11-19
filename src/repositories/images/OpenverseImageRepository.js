import { presentParticiple } from '../../domain/inflect';
import { normalizeTerm } from '../../domain/word';

export const OPENVERSE_API_URL = 'https://api.openverse.org/v1/images/';

/** "by-nc" + "2.0" → "CC BY-NC 2.0". */
function licenseName({ license, license_version: version }) {
  if (license === 'cc0') return 'CC0';
  if (license === 'pdm') return 'Public domain';
  return `CC ${String(license ?? '').toUpperCase()} ${version ?? ''}`.trim();
}

/**
 * `ImageRepository` adapter (#12) for Openverse: openly licensed photos from
 * Flickr, museums and other collections, searched by keyword. Free and
 * without a key (anonymous use), but it is sometimes slow or answers 5xx;
 * failures are not cached so the word is retried later.
 *
 * Keyword search finds the noun ("stand" → market stands). For verbs
 * (`partOfSpeech: 'verb'`) it searches the action instead, with the queries
 * built by `verbQueries` from the "-ing" form ("person standing" and
 * "standing"), interleaved.
 *
 * @param {Object} [options]
 * @param {string} [options.endpoint]
 * @param {number} [options.max]  Maximum images per word.
 * @param {(ing: string) => string[]} [options.verbQueries]  Searches for a verb, from its "-ing" form.
 * @param {typeof fetch} [options.fetchFn]
 * @returns {import('../contracts').ImageRepository}
 */
export function createOpenverseImageRepository({
  endpoint = OPENVERSE_API_URL,
  max = 4,
  verbQueries = (ing) => [`person ${ing}`, ing],
  fetchFn = (...args) => globalThis.fetch(...args),
} = {}) {
  const cache = new Map();

  /** One search; `null` when it failed (so it is not cached). */
  async function search(q, signal) {
    if (cache.has(q)) return cache.get(q);
    try {
      // Spaces must go as %20: Openverse finds nothing for "person+standing".
      const query = `q=${encodeURIComponent(q)}&page_size=${max}&mature=false`;
      const response = await fetchFn(`${endpoint}?${query}`, { signal });
      if (!response.ok) return null;
      const results = (await response.json())?.results ?? [];
      const images = results
        .filter((r) => r.thumbnail)
        .map((r) => ({
          url: r.thumbnail,
          width: r.width,
          height: r.height,
          title: r.title || 'Untitled',
          author: r.creator || 'Unknown author',
          license: licenseName(r),
          licenseUrl: r.license_url ?? null,
          pageUrl: r.foreign_landing_url || r.url,
          source: 'openverse',
        }));
      cache.set(q, images);
      return images;
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      return null;
    }
  }

  return {
    async findImages(term, { signal, partOfSpeech } = {}) {
      const normalized = normalizeTerm(term);
      if (!normalized) return [];
      const word = partOfSpeech === 'verb' ? presentParticiple(normalized) : normalized;
      const queries = partOfSpeech === 'verb' ? verbQueries(word) : [normalized];
      // Titles that name the word ("Person Standing on…") first: keyword search also returns loosely related photos.
      const named = (image) => image.title.toLowerCase().includes(word);
      const lists = (await Promise.all(queries.map((q) => search(q, signal)))).map((l) =>
        [...(l ?? [])].sort((a, b) => Number(named(b)) - Number(named(a))),
      );
      // Interleave the queries: "person standing" 1, "standing" 1, "person standing" 2…
      const merged = [];
      for (let i = 0; i < max; i += 1) {
        for (const list of lists) {
          if (list[i] && !merged.some((m) => m.url === list[i].url)) merged.push(list[i]);
        }
      }
      return merged;
    },
  };
}
