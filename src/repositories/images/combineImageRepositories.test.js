import { describe, expect, it } from 'vitest';
import { assertImplements } from '../contracts';
import { combineImageRepositories } from './combineImageRepositories';

const img = (source, n) => ({ url: `https://img.test/${source}/${n}`, source });
const repo = (images) => ({ findImages: async () => images });

describe('combineImageRepositories', () => {
  it('fulfills the ImageRepository contract', () => {
    expect(() => assertImplements('ImageRepository', combineImageRepositories([]))).not.toThrow();
  });

  it('interleaves the sources in order of preference and removes duplicates', async () => {
    const combined = combineImageRepositories([
      repo([img('a', 1), img('a', 2), img('a', 3)]),
      repo([img('b', 1), img('a', 2)]),
    ]);
    expect((await combined.findImages('x')).map((i) => i.url)).toEqual([
      'https://img.test/a/1',
      'https://img.test/b/1',
      'https://img.test/a/2',
      'https://img.test/a/3',
    ]);
  });

  it('uses verbOrder for verbs', async () => {
    const combined = combineImageRepositories([repo([img('a', 1)]), repo([img('b', 1), img('b', 2)])], { verbOrder: [1, 0] });
    expect((await combined.findImages('x', { partOfSpeech: 'verb' })).map((i) => i.url)).toEqual([
      'https://img.test/b/1',
      'https://img.test/b/2',
      'https://img.test/a/1',
    ]);
    expect((await combined.findImages('x')).map((i) => i.url)[0]).toBe('https://img.test/a/1');
  });

  it('reports partial results as each source answers', async () => {
    let releaseSlow;
    const slow = { findImages: () => new Promise((resolve) => (releaseSlow = () => resolve([img('b', 1)]))) };
    const partial = [];
    const combined = combineImageRepositories([repo([img('a', 1)]), slow]);

    const done = combined.findImages('x', { onPartial: (images) => partial.push(images.map((i) => i.url)) });
    await new Promise((r) => setTimeout(r, 0));
    expect(partial).toEqual([['https://img.test/a/1']]);

    releaseSlow();
    expect((await done).map((i) => i.url)).toEqual(['https://img.test/a/1', 'https://img.test/b/1']);
    expect(partial).toHaveLength(2);
  });

  it('ignores a source that fails or does not answer in time', async () => {
    const combined = combineImageRepositories(
      [
        repo([img('a', 1)]),
        { findImages: async () => Promise.reject(new Error('boom')) },
        { findImages: () => new Promise(() => {}) },
      ],
      { timeoutMs: 20 },
    );
    expect((await combined.findImages('x')).map((i) => i.url)).toEqual(['https://img.test/a/1']);
  });
});
