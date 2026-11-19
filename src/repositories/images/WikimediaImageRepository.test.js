import { describe, expect, it, vi } from 'vitest';
import { assertImplements } from '../contracts';
import { createWikimediaImageRepository, plainText } from './WikimediaImageRepository';
import commonsBall from './__fixtures__/commons-ball.json';
import wikipediaBall from './__fixtures__/wikipedia-ball.json';
import wikipediaGuy from './__fixtures__/wikipedia-guy.json';
import commonsStation from './__fixtures__/commons-station.json';
import wikidataStation from './__fixtures__/wikidata-station.json';
import wikipediaStation from './__fixtures__/wikipedia-station.json';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });

const NO_SENSES = { results: { bindings: [] } };

/** Answers Wikipedia, Wikidata and Commons requests with the recorded fixtures. */
function fakeFetch({ wikipedia, wikidata = NO_SENSES, commons = { query: { pages: [] } } }) {
  return vi.fn(async (url) => {
    if (url.startsWith('https://en.wikipedia.org')) return ok(wikipedia);
    if (url.startsWith('https://query.wikidata.org')) return ok(wikidata);
    return ok(commons);
  });
}

describe('WikimediaImageRepository', () => {
  it('fulfills the ImageRepository contract', () => {
    expect(() => assertImplements('ImageRepository', createWikimediaImageRepository())).not.toThrow();
  });

  it('returns the article lead image first, then other pictures, with license and author', async () => {
    const fetchFn = fakeFetch({ wikipedia: wikipediaBall, commons: commonsBall });
    const images = await createWikimediaImageRepository({ fetchFn }).findImages(' Ball ');

    expect(images).toHaveLength(6);
    expect(images[0]).toMatchObject({
      title: 'Many balls.jpg',
      author: 'Conrad 7',
      pageUrl: 'https://commons.wikimedia.org/wiki/File:Many_balls.jpg',
      source: 'wikipedia',
    });
    expect(images[0].url).toMatch(/^https:\/\/.*Many_balls\.jpg/);
    expect(images[0].license).toMatch(/^CC|Public domain/);
    expect(images.map((i) => i.title)).not.toContain('OOjs UI icon edit-ltr-progressive.svg');

    const wikipediaUrl = new URL(fetchFn.mock.calls[0][0]);
    expect(wikipediaUrl.searchParams.get('titles')).toBe('ball');
    expect(wikipediaUrl.searchParams.get('origin')).toBe('*');
    const commonsUrl = new URL(fetchFn.mock.calls.find(([url]) => url.startsWith('https://commons'))[0]);
    expect(commonsUrl.searchParams.get('titles').split('|')[0]).toBe('File:Many balls.jpg');
  });

  it('uses the images of the word senses in Wikidata when Wikipedia has a disambiguation page', async () => {
    const fetchFn = fakeFetch({ wikipedia: wikipediaStation, wikidata: wikidataStation, commons: commonsStation });
    const images = await createWikimediaImageRepository({ fetchFn }).findImages('station');

    expect(images).toEqual([expect.objectContaining({ title: 'Crèvecœur-le-Grand-la-Gare-1.jpg', license: 'Public domain', source: 'wikidata' })]);
    const sparql = new URL(fetchFn.mock.calls.find(([url]) => url.startsWith('https://query.wikidata'))[0]).searchParams.get('query');
    expect(sparql).toContain('wikibase:lemma "station"@en');
  });

  it('merges both sources: article lead image, then sense images, then other article pictures', async () => {
    const commons = { query: { pages: [...commonsBall.query.pages, ...commonsStation.query.pages] } };
    const fetchFn = fakeFetch({ wikipedia: wikipediaBall, wikidata: wikidataStation, commons });
    const images = await createWikimediaImageRepository({ fetchFn }).findImages('ball');

    expect(images.slice(0, 3).map((i) => [i.source, i.title])).toEqual([
      ['wikipedia', 'Many balls.jpg'],
      ['wikidata', 'Crèvecœur-le-Grand-la-Gare-1.jpg'],
      ['wikipedia', '20190118B Plastic bowling ball fingertip grip.jpg'],
    ]);
  });

  it('returns no images when neither Wikipedia nor Wikidata has one (e.g. "guy"), without asking Commons', async () => {
    const fetchFn = fakeFetch({ wikipedia: wikipediaGuy });
    expect(await createWikimediaImageRepository({ fetchFn }).findImages('guy')).toEqual([]);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('escapes quotes in the SPARQL lemma', async () => {
    const fetchFn = fakeFetch({ wikipedia: wikipediaGuy });
    await createWikimediaImageRepository({ fetchFn }).findImages('a"b');
    const sparqlCall = fetchFn.mock.calls.find(([url]) => url.startsWith('https://query.wikidata'));
    expect(new URL(sparqlCall[0]).searchParams.get('query')).toContain('"a\\"b"@en');
  });

  it('drops files that are not on Commons and caches each word', async () => {
    const fetchFn = fakeFetch({ wikipedia: wikipediaBall, commons: { query: { pages: [commonsBall.query.pages[0]] } } });
    const repo = createWikimediaImageRepository({ fetchFn });

    expect(await repo.findImages('ball')).toHaveLength(1);
    await repo.findImages('ball');
    expect(fetchFn).toHaveBeenCalledTimes(3); // Wikipedia + Wikidata + Commons, only the first time
  });

  it('does not cache failed answers (e.g. a 429 rate limit)', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({}) })
      .mockImplementation(async (url) => ok(url.startsWith('https://en.wikipedia.org') ? wikipediaBall : commonsBall));
    const repo = createWikimediaImageRepository({ fetchFn });

    expect(await repo.findImages('ball')).toEqual([]);
    expect(await repo.findImages('ball')).toHaveLength(6);
  });

  it('never rejects on network errors', async () => {
    const repo = createWikimediaImageRepository({ fetchFn: vi.fn().mockRejectedValue(new TypeError('offline')) });
    expect(await repo.findImages('ball')).toEqual([]);
  });

  it('turns HTML attributions into plain text', () => {
    expect(plainText('<a href="//x">Jane &amp; John</a> <span>Doe</span>')).toBe('Jane & John Doe');
  });
});
