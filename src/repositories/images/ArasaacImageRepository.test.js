import { describe, expect, it, vi } from 'vitest';
import { assertImplements } from '../contracts';
import { cleanMeaning, createArasaacImageRepository } from './ArasaacImageRepository';
import stand from './__fixtures__/arasaac-stand.json';
import whole from './__fixtures__/arasaac-whole.json';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });

describe('ArasaacImageRepository', () => {
  it('fulfills the ImageRepository contract', () => {
    expect(() => assertImplements('ImageRepository', createArasaacImageRepository())).not.toThrow();
  });

  it('returns the pictograms whose keyword is exactly the word, with attribution', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(stand));
    const images = await createArasaacImageRepository({ fetchFn }).findImages(' Stand ');

    expect(fetchFn.mock.calls[0][0]).toBe('https://api.arasaac.org/api/pictograms/en/search/stand');
    expect(images).toHaveLength(4);
    expect(images.every((i) => i.source === 'arasaac' && i.license === 'CC BY-NC-SA')).toBe(true);
    expect(images[0].url).toMatch(/^https:\/\/static\.arasaac\.org\/pictograms\/\d+\/\d+_300\.png$/);
    expect(images[0].author).toBe('Sergio Palao (ARASAAC)');
  });

  it('puts the verb sense first for verbs and the other senses first otherwise', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(stand));
    const repo = createArasaacImageRepository({ fetchFn, max: 10 });

    const asVerb = await repo.findImages('stand', { partOfSpeech: 'verb' });
    const asNoun = await repo.findImages('stand');

    expect(asVerb[0].title).toMatch(/^stand: intr\. Remain upright/);
    expect(asNoun[0].pageUrl).toContain('/28877/'); // "stand" as a sales booth
  });

  it('skips pictograms of adjectives and adverbs (e.g. "whole")', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(whole));
    expect(await createArasaacImageRepository({ fetchFn }).findImages('whole')).toEqual([]);
  });

  it('adds the meaning of the pictogram as a caption when it says something', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(stand));
    const [first] = await createArasaacImageRepository({ fetchFn }).findImages('stand', { partOfSpeech: 'verb' });
    expect(first.caption).toBe('Remain upright, standing firmly on foot…');
    expect(cleanMeaning('Common.')).toBeNull();
    expect(cleanMeaning('')).toBeNull();
    expect(cleanMeaning('tr. Sprinkle water on a surface: watering the garden.')).toBe('Sprinkle water on a surface: watering the garden.');
  });

  it('caches "no pictogram" (404) but retries after other errors', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockResolvedValue(ok(stand));
    const repo = createArasaacImageRepository({ fetchFn });

    expect(await repo.findImages('determine')).toEqual([]);
    expect(await repo.findImages('determine')).toEqual([]);
    expect(fetchFn).toHaveBeenCalledTimes(1);

    expect(await repo.findImages('stand')).toEqual([]);
    expect(await repo.findImages('stand')).toHaveLength(4);
  });
});
