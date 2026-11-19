import { normalizeTerm } from '../../domain/word';

export const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
export const COMMONS_API_URL = 'https://commons.wikimedia.org/w/api.php';
export const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

/** Photos and drawings only: SVG files on articles are mostly icons and logos. */
const PICTURE = /\.(jpe?g|png)$/i;

const fileName = (title) => title.replace(/^File:/, '').replace(/_/g, ' ');

/** Commons returns the author as HTML; keep only its text. */
export function plainText(html = '') {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * `ImageRepository` adapter (#12, FR-006) built on Wikimedia. Two sources are
 * asked in parallel and merged, so there are alternatives for "Another image":
 * 1. Wikipedia: the English article named like the word (following
 *    redirects): its lead image and its other pictures. Disambiguation pages
 *    and missing articles give none.
 * 2. Wikidata: the images (P18) of the items that the senses of the English
 *    lexeme point to (P5137), e.g. "station" → a train station.
 * Order: Wikipedia lead image, Wikidata sense images, other article pictures.
 * Commons gives license, author and a thumbnail; files not on Commons
 * (non-free local files) are dropped.
 *
 * @param {Object} [options]
 * @param {string} [options.wikipediaEndpoint]
 * @param {string} [options.commonsEndpoint]
 * @param {string} [options.wikidataEndpoint]  SPARQL endpoint of the Wikidata Query Service.
 * @param {number} [options.max]  Maximum images per word.
 * @param {number} [options.width]  Thumbnail width in pixels.
 * @param {typeof fetch} [options.fetchFn]
 * @returns {import('../contracts').ImageRepository}
 */
export function createWikimediaImageRepository({
  wikipediaEndpoint = WIKIPEDIA_API_URL,
  commonsEndpoint = COMMONS_API_URL,
  wikidataEndpoint = WIKIDATA_SPARQL_URL,
  max = 8,
  width = 480,
  fetchFn = (...args) => globalThis.fetch(...args),
} = {}) {
  const cache = new Map();

  async function getJson(endpoint, params, signal) {
    const query = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', origin: '*', ...params });
    const response = await fetchFn(`${endpoint}?${query}`, { signal });
    // Throw on HTTP errors (e.g. 429 rate limit) so the failure is not cached.
    if (!response.ok) throw new Error(`Wikimedia answered ${response.status}`);
    return response.json();
  }

  async function wikipediaFiles(term, signal) {
    const data = await getJson(
      wikipediaEndpoint,
      {
        redirects: '1',
        titles: term,
        prop: 'pageimages|pageprops|images',
        piprop: 'name',
        pilicense: 'free',
        ppprop: 'disambiguation',
        imlimit: '50',
      },
      signal,
    );
    const page = data?.query?.pages?.[0];
    if (!page || page.missing || page.pageprops?.disambiguation !== undefined) return { lead: null, others: [] };

    const lead = page.pageimage ? fileName(page.pageimage) : null;
    const others = (page.images ?? []).map((i) => fileName(i.title)).filter((n) => PICTURE.test(n) && n !== lead);
    return { lead, others };
  }

  /** Images of the senses of the English lexeme `term` (one SPARQL query). */
  async function wikidataFiles(term, signal) {
    const lemma = term.replace(/["\\]/g, '\\$&');
    const query = `SELECT ?image WHERE {
      ?lexeme dct:language wd:Q1860 ; wikibase:lemma "${lemma}"@en ; ontolex:sense ?sense .
      ?sense wdt:P5137 ?item . ?item wdt:P18 ?image .
    } LIMIT ${max}`;
    const response = await fetchFn(`${wikidataEndpoint}?${new URLSearchParams({ query, format: 'json' })}`, {
      signal,
      headers: { Accept: 'application/sparql-results+json' },
    });
    if (!response.ok) throw new Error(`Wikidata answered ${response.status}`);
    const rows = (await response.json())?.results?.bindings ?? [];
    const files = rows.map((r) => fileName(decodeURIComponent(r.image.value.split('/Special:FilePath/')[1] ?? '')));
    return [...new Set(files.filter((f) => f && /\.(jpe?g|png|gif|tiff?|webp)$/i.test(f)))];
  }

  /** @param {{ name: string, source: 'wikipedia'|'wikidata' }[]} files */
  async function describe(files, signal) {
    const data = await getJson(
      commonsEndpoint,
      {
        titles: files.map((f) => `File:${f.name}`).join('|'),
        prop: 'imageinfo',
        iiprop: 'url|extmetadata',
        iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
        iiurlwidth: String(width),
      },
      signal,
    );
    const byName = new Map((data?.query?.pages ?? []).map((p) => [fileName(p.title), p]));
    return files
      .map(({ name, source }) => {
        const info = byName.get(name)?.imageinfo?.[0];
        if (!info?.thumburl) return null;
        const meta = info.extmetadata ?? {};
        return {
          url: info.thumburl,
          width: info.thumbwidth,
          height: info.thumbheight,
          title: name,
          author: plainText(meta.Artist?.value) || 'Unknown author',
          license: plainText(meta.LicenseShortName?.value) || 'See source',
          licenseUrl: meta.LicenseUrl?.value ?? null,
          pageUrl: info.descriptionurl,
          source,
        };
      })
      .filter(Boolean);
  }

  return {
    async findImages(term, { signal } = {}) {
      const normalized = normalizeTerm(term);
      if (!normalized) return [];
      if (cache.has(normalized)) return cache.get(normalized);
      try {
        const [article, senses] = await Promise.all([wikipediaFiles(normalized, signal), wikidataFiles(normalized, signal)]);
        const files = [];
        const add = (name, source) => !files.some((f) => f.name === name) && files.push({ name, source });
        if (article.lead) add(article.lead, 'wikipedia');
        senses.forEach((name) => add(name, 'wikidata'));
        article.others.forEach((name) => add(name, 'wikipedia'));
        const images = files.length ? await describe(files.slice(0, max), signal) : [];
        cache.set(normalized, images);
        return images;
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        return []; // A missing image must never break the screen; not cached, so it is retried later.
      }
    },
  };
}
