import { describe, expect, it, vi } from 'vitest';
import { assertImplements } from '../contracts';
import { createFreeDictionaryWordRepository } from './FreeDictionaryWordRepository';
import hello from './__fixtures__/hello.json';
import notFoundBody from './__fixtures__/notFound.json';

const jsonResponse = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => body,
});

describe('FreeDictionaryWordRepository', () => {
  it('fulfills the WordLookupRepository contract', () => {
    expect(() =>
      assertImplements('WordLookupRepository', createFreeDictionaryWordRepository()),
    ).not.toThrow();
  });

  it('returns the mapped word when it exists', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(200, hello));
    const repo = createFreeDictionaryWordRepository({ baseUrl: 'https://api.test', fetchFn });

    const result = await repo.findByTerm('  Hello ');

    expect(fetchFn).toHaveBeenCalledWith('https://api.test/hello', { signal: undefined });
    expect(result.status).toBe('found');
    expect(result.word.word).toBe('hello');
  });

  it('encodes the term in the URL', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(404, notFoundBody));
    const repo = createFreeDictionaryWordRepository({ baseUrl: 'https://api.test', fetchFn });

    await repo.findByTerm('ice cream/x');

    expect(fetchFn.mock.calls[0][0]).toBe('https://api.test/ice%20cream%2Fx');
  });

  it('returns not_found on 404', async () => {
    const repo = createFreeDictionaryWordRepository({
      fetchFn: vi.fn().mockResolvedValue(jsonResponse(404, notFoundBody)),
    });

    expect(await repo.findByTerm('qwertyzx')).toEqual({
      status: 'not_found',
      message: 'No definitions found for "qwertyzx".',
    });
  });

  it('returns not_found without calling the API for an empty term', async () => {
    const fetchFn = vi.fn();
    const repo = createFreeDictionaryWordRepository({ fetchFn });

    expect((await repo.findByTerm('   ')).status).toBe('not_found');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('returns error on server errors, network failures and bad payloads', async () => {
    const serverError = createFreeDictionaryWordRepository({
      fetchFn: vi.fn().mockResolvedValue(jsonResponse(500, {})),
    });
    const offline = createFreeDictionaryWordRepository({
      fetchFn: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    });
    const badPayload = createFreeDictionaryWordRepository({
      fetchFn: vi.fn().mockResolvedValue(jsonResponse(200, { unexpected: true })),
    });

    expect((await serverError.findByTerm('hello')).status).toBe('error');
    expect((await offline.findByTerm('hello')).status).toBe('error');
    expect((await badPayload.findByTerm('hello')).status).toBe('error');
  });

  it('propagates aborts so callers can ignore cancelled searches', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const repo = createFreeDictionaryWordRepository({ fetchFn: vi.fn().mockRejectedValue(abort) });

    await expect(repo.findByTerm('hello')).rejects.toBe(abort);
  });
});
