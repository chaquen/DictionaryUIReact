import { describe, expect, it, vi } from 'vitest';
import { assertImplements } from '../contracts';
import { createWikimediaCommonsPronunciationRepository } from './WikimediaCommonsPronunciationRepository';
import hello from './__fixtures__/hello.json';
import missing from './__fixtures__/missing.json';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });

describe('WikimediaCommonsPronunciationRepository', () => {
  it('fulfills the PronunciationRepository contract', () => {
    expect(() =>
      assertImplements('PronunciationRepository', createWikimediaCommonsPronunciationRepository()),
    ).not.toThrow();
  });

  it('returns the MP3 of the preferred accent regardless of response order', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(hello));
    const repo = createWikimediaCommonsPronunciationRepository({ fetchFn });

    const url = await repo.findAudioUrl(' Hello ');

    expect(url).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/transcoded/5/52/En-us-hello.ogg/En-us-hello.ogg.mp3',
    );
    const requested = new URL(fetchFn.mock.calls[0][0]);
    expect(requested.searchParams.get('titles')).toBe(
      'File:En-us-hello.ogg|File:En-uk-hello.ogg|File:En-au-hello.ogg',
    );
    expect(requested.searchParams.get('origin')).toBe('*');
  });

  it('honors a custom accent preference', async () => {
    const repo = createWikimediaCommonsPronunciationRepository({
      accents: ['uk', 'us'],
      fetchFn: vi.fn().mockResolvedValue(ok(hello)),
    });

    expect(await repo.findAudioUrl('hello')).toMatch(/En-uk-hello\.ogg\.mp3$/);
  });

  it('returns null when there is no recording', async () => {
    const repo = createWikimediaCommonsPronunciationRepository({
      fetchFn: vi.fn().mockResolvedValue(ok(missing)),
    });

    expect(await repo.findAudioUrl('qwertyzx')).toBeNull();
  });

  it('caches results per word', async () => {
    const fetchFn = vi.fn().mockResolvedValue(ok(hello));
    const repo = createWikimediaCommonsPronunciationRepository({ fetchFn });

    await repo.findAudioUrl('hello');
    await repo.findAudioUrl('HELLO');

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('never fails because of the network', async () => {
    const offline = createWikimediaCommonsPronunciationRepository({
      fetchFn: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    });
    const serverError = createWikimediaCommonsPronunciationRepository({
      fetchFn: vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    });

    expect(await offline.findAudioUrl('hello')).toBeNull();
    expect(await serverError.findAudioUrl('hello')).toBeNull();
  });
});
