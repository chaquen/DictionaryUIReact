import { describe, expect, it, vi } from 'vitest';
import { withImageRelevance } from './withImageRelevance';

const img = (n) => ({ url: `https://img.test/${n}` });
const source = (images) => ({ findImages: vi.fn(async () => images) });
const judgeOf = (verdicts, availability = 'available') => ({
  availability: async () => availability,
  judge: vi.fn(async (image) => verdicts[image.url] ?? 'unknown'),
});

describe('withImageRelevance', () => {
  it('keeps the pictures that show the meaning, then the unknown ones, and drops the rest', async () => {
    const judge = judgeOf({ 'https://img.test/1': 'no_match', 'https://img.test/2': 'unknown', 'https://img.test/3': 'match' });
    const images = await withImageRelevance(source([img(1), img(2), img(3)]), judge).findImages('stand', { definition: 'to be upright' });

    expect(images.map((i) => i.url)).toEqual(['https://img.test/3', 'https://img.test/2']);
    expect(images[0].checked).toBe(true);
    expect(judge.judge).toHaveBeenCalledWith(img(1), expect.objectContaining({ term: 'stand', definition: 'to be upright' }));
  });

  it('passes through without a definition or without local AI', async () => {
    const all = [img(1), img(2)];
    const judge = judgeOf({});
    expect(await withImageRelevance(source(all), judge).findImages('x')).toEqual(all);
    expect(await withImageRelevance(source(all), judgeOf({}, 'downloadable')).findImages('x', { definition: 'd' })).toEqual(all);
    expect(judge.judge).not.toHaveBeenCalled();
  });

  it('reports each confirmed picture as soon as it is judged and limits the work', async () => {
    const many = [1, 2, 3, 4].map(img);
    const judge = judgeOf(Object.fromEntries(many.map((i) => [i.url, 'match'])));
    const partial = [];
    await withImageRelevance(source(many), judge, { maxJudged: 2 }).findImages('x', {
      definition: 'd',
      onPartial: (list) => partial.push(list.length),
    });

    expect(partial).toEqual([1, 2]);
    expect(judge.judge).toHaveBeenCalledTimes(2);
  });
});
