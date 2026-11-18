import { describe, expect, it, vi } from 'vitest';
import { buildWord, createFakeWordLookup } from '../../test/fakes';
import { withPronunciation } from './withPronunciation';

const pronunciationReturning = (value) => ({ findAudioUrl: vi.fn().mockResolvedValue(value) });

describe('withPronunciation', () => {
  it('replaces the audio with the human recording', async () => {
    const repo = withPronunciation(
      createFakeWordLookup([buildWord({ audioUrl: 'https://broken/hello.mp3' })]),
      pronunciationReturning('https://commons/En-us-hello.ogg.mp3'),
    );

    const result = await repo.findByTerm('hello');

    expect(result.word.audioUrl).toBe('https://commons/En-us-hello.ogg.mp3');
  });

  it('keeps the dictionary audio when there is no recording', async () => {
    const repo = withPronunciation(
      createFakeWordLookup([buildWord({ audioUrl: 'https://dictionary/hello.mp3' })]),
      pronunciationReturning(null),
    );

    expect((await repo.findByTerm('hello')).word.audioUrl).toBe('https://dictionary/hello.mp3');
  });

  it('leaves not-found results untouched', async () => {
    const repo = withPronunciation(createFakeWordLookup([]), pronunciationReturning('https://x.mp3'));

    expect((await repo.findByTerm('qwertyzx')).status).toBe('not_found');
  });

  it('does not break the search when the pronunciation source fails', async () => {
    const repo = withPronunciation(createFakeWordLookup(), {
      findAudioUrl: vi.fn().mockRejectedValue(new Error('boom')),
    });

    expect((await repo.findByTerm('hello')).status).toBe('found');
  });
});
