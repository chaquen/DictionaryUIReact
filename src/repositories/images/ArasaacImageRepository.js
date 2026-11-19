import { normalizeTerm } from '../../domain/word';

export const ARASAAC_API_URL = 'https://api.arasaac.org/api/pictograms/en/search/';
export const ARASAAC_STATIC_URL = 'https://static.arasaac.org/pictograms/';
export const ARASAAC_ATTRIBUTION =
  'Pictograms author: Sergio Palao. Origin: ARASAAC (https://arasaac.org). License: CC BY-NC-SA. Owner: Government of Aragon (Spain).';

/** ARASAAC keyword types: 1 proper name, 2 common noun, 3 verb, 4 adjective/adverb, 5 social, 6 other. */
const NOUN = 2;
const VERB = 3;

/**
 * ARASAAC's meaning of a keyword without grammar labels ("intr. Remain
 * upright…" → "Remain upright…"); null when it says nothing useful
 * ("Common.", empty).
 */
export function cleanMeaning(meaning) {
  let text = (meaning ?? '').replace(/^\s*(?:(?:intr|tr|prnl|adj|adv|n|v)\.\s*)+/i, '').trim();
  // Some meanings are cut off in the source ("…standing firmly on foot or"): end them cleanly.
  if (/\s(?:or|and|of|the|a|an|to|with|on|in|for|by)$/i.test(text)) text = `${text.replace(/\s+\S+$/, '')}…`;
  return text.split(/\s+/).length >= 3 ? text : null;
}

/**
 * `ImageRepository` adapter (#12, P14) for ARASAAC pictograms: simple
 * drawings made for language learning and augmentative communication, with
 * the meaning of each keyword ("stand": remain upright). Free, no key.
 *
 * Only pictograms whose keyword is exactly the word and is a noun or a verb
 * are returned: pictograms of abstract adjectives and adverbs ("whole" →
 * three dots in an oval) are conventions a learner cannot read. With
 * `partOfSpeech: 'verb'` verb keywords go first ("stand" → a person standing
 * before a sales stand); otherwise the other senses go first.
 *
 * License CC BY-NC-SA (non-commercial): the attribution is shown in the app.
 *
 * @param {Object} [options]
 * @param {string} [options.endpoint]
 * @param {number} [options.max]  Maximum pictograms per word.
 * @param {number} [options.size]  Pixel size of the PNG (300 or 500).
 * @param {typeof fetch} [options.fetchFn]
 * @returns {import('../contracts').ImageRepository}
 */
export function createArasaacImageRepository({
  endpoint = ARASAAC_API_URL,
  max = 4,
  size = 300,
  fetchFn = (...args) => globalThis.fetch(...args),
} = {}) {
  const cache = new Map();

  return {
    async findImages(term, { signal, partOfSpeech } = {}) {
      const normalized = normalizeTerm(term);
      if (!normalized) return [];
      const key = `${normalized}|${partOfSpeech ?? ''}`;
      if (cache.has(key)) return cache.get(key);
      try {
        const response = await fetchFn(`${endpoint}${encodeURIComponent(normalized)}`, { signal });
        // 404 means "no pictogram for this word": a valid answer, so it is cached.
        if (response.status === 404) {
          cache.set(key, []);
          return [];
        }
        if (!response.ok) return [];
        const pictograms = (await response.json()) ?? [];
        const wantVerb = partOfSpeech === 'verb';
        const images = pictograms
          .filter((p) => !p.violence && !p.sex)
          .map((p) => ({ p, match: p.keywords?.find((k) => k.keyword?.toLowerCase() === normalized) }))
          .filter(({ match }) => match && (match.type === NOUN || match.type === VERB))
          .sort((a, b) => Number((b.match.type === VERB) === wantVerb) - Number((a.match.type === VERB) === wantVerb))
          .slice(0, max)
          .map(({ p, match }) => ({
            url: `${ARASAAC_STATIC_URL}${p._id}/${p._id}_${size}.png`,
            width: size,
            height: size,
            title: match.meaning ? `${match.keyword}: ${match.meaning}` : match.keyword,
            caption: cleanMeaning(match.meaning),
            author: 'Sergio Palao (ARASAAC)',
            license: 'CC BY-NC-SA',
            licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
            pageUrl: `https://arasaac.org/pictograms/en/${p._id}/${encodeURIComponent(normalized)}`,
            source: 'arasaac',
          }));
        cache.set(key, images);
        return images;
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        return [];
      }
    },
  };
}
