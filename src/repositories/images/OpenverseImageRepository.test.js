import { describe, expect, it, vi } from 'vitest';
import { assertImplements } from '../contracts';
import { createOpenverseImageRepository } from './OpenverseImageRepository';
import stand from './__fixtures__/openverse-stand.json';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });

describe('OpenverseImageRepository', () => {
  it('fulfills the ImageRepository contract', () => {
    expect(() => assertImplements('ImageRepository', createOpenverseImageRepository())).not.toThrow();
  });

  it('maps the results with author, license and source page', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(stand));
    const images = await createOpenverseImageRepository({ fetchFn }).findImages(' Stand ');

    expect(images).toHaveLength(4);
    expect(images[0]).toEqual({
      url: 'https://api.openverse.org/v1/images/8d5c8124-2a4d-4be2-8591-8af679d37f37/thumb/',
      width: 1024,
      height: 683,
      title: 'Hand-made necklace stands',
      author: 'Kotomi_',
      license: 'CC BY-NC 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc/2.0/',
      pageUrl: 'https://www.flickr.com/photos/23586209@N03/4119928273',
      source: 'openverse',
    });
    const url = new URL(fetchFn.mock.calls[0][0]);
    expect(url.searchParams.get('q')).toBe('stand');
    expect(url.searchParams.get('mature')).toBe('false');
  });

  it('searches the action for verbs ("person standing" and "standing") and interleaves them', async () => {
    const other = { results: stand.results.map((r) => ({ ...r, thumbnail: `${r.thumbnail}?alt` })) };
    const fetchFn = vi.fn(async (url) => ok(new URL(url).searchParams.get('q') === 'person standing' ? stand : other));
    const images = await createOpenverseImageRepository({ fetchFn }).findImages('stand', { partOfSpeech: 'verb' });

    expect(fetchFn.mock.calls.map(([url]) => new URL(url).searchParams.get('q'))).toEqual(['person standing', 'standing']);
    expect(fetchFn.mock.calls[0][0]).toContain('q=person%20standing');
    expect(images.slice(0, 2).map((i) => i.url)).toEqual([stand.results[0].thumbnail, `${stand.results[0].thumbnail}?alt`]);
  });

  it('puts first the results whose title names the word', async () => {
    const results = [{ ...stand.results[0], title: 'OOP$EE: fortune of war' }, { ...stand.results[1], title: 'Person Standing at Sunset' }];
    const fetchFn = vi.fn().mockResolvedValue(ok({ results }));
    const images = await createOpenverseImageRepository({ fetchFn, verbQueries: (ing) => [`person ${ing}`] }).findImages('stand', {
      partOfSpeech: 'verb',
    });
    expect(images.map((i) => i.title)).toEqual(['Person Standing at Sunset', 'OOP$EE: fortune of war']);
  });

  it('returns nothing on errors and retries later (failures are not cached)', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 504, json: async () => ({}) })
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValue(ok(stand));
    const repo = createOpenverseImageRepository({ fetchFn });

    expect(await repo.findImages('stand')).toEqual([]);
    expect(await repo.findImages('stand')).toEqual([]);
    expect(await repo.findImages('stand')).toHaveLength(4);
  });
});
