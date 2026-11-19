import { describe, expect, it, vi } from 'vitest';
import { assertImplements } from '../contracts';
import { IMAGE_JUDGE_OPTIONS, SUBJECT_PROMPT, createChromeImageJudgeRepository } from './ChromeImageJudgeRepository';

const picture = { url: 'https://img.test/1.jpg' };
const context = { term: 'stand', definition: 'to be upright; not be sitting or lying down' };
const okBlob = { ok: true, blob: async () => new Blob(['x'], { type: 'image/jpeg' }) };

function fakeLanguageModel({ availability = 'available', subject = 'A person standing upright', answer = 'yes' } = {}) {
  const prompts = [];
  const session = {
    clone: vi.fn(async () => ({
      prompt: vi.fn(async (input, options) => {
        prompts.push({ input, options });
        return Array.isArray(input) ? subject : answer;
      }),
      destroy: vi.fn(),
    })),
  };
  return { prompts, api: { availability: vi.fn(async () => availability), create: vi.fn(async () => session) } };
}

describe('ChromeImageJudgeRepository', () => {
  it('fulfills the contract', () => {
    expect(() => assertImplements('ImageJudgeRepository', createChromeImageJudgeRepository({ api: undefined }))).not.toThrow();
  });

  it('asks for the main subject of the picture, then whether it is an example of the meaning', async () => {
    const { api, prompts } = fakeLanguageModel({ answer: 'Yes.' });
    const judge = createChromeImageJudgeRepository({ api, fetchFn: vi.fn(async () => okBlob) });

    expect(await judge.judge(picture, context)).toBe('match');
    expect(api.availability).toHaveBeenCalledWith(IMAGE_JUDGE_OPTIONS);
    const [describe, verdict] = prompts;
    expect(describe.input[0].content[0].value).toBe(SUBJECT_PROMPT);
    expect(describe.input[0].content[1]).toEqual({ type: 'image', value: expect.any(Blob) });
    expect(verdict.input).toContain('Main subject: "A person standing upright". Word: "stand" (to be upright');
  });

  it('caches verdicts and rejects pictures that do not show the meaning', async () => {
    const { api, prompts } = fakeLanguageModel({ subject: 'Mountains under a cloudy sky', answer: 'no' });
    const judge = createChromeImageJudgeRepository({ api, fetchFn: vi.fn(async () => okBlob) });

    expect(await judge.judge(picture, context)).toBe('no_match');
    expect(await judge.judge(picture, context)).toBe('no_match');
    expect(prompts).toHaveLength(2); // one judgement (two prompts), then the cache
  });

  it('answers unknown without the model, when the picture cannot be downloaded or the model is slow', async () => {
    expect(await createChromeImageJudgeRepository({ api: undefined }).judge(picture, context)).toBe('unknown');

    const { api } = fakeLanguageModel();
    const cors = createChromeImageJudgeRepository({ api, fetchFn: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) });
    expect(await cors.judge(picture, context)).toBe('unknown');

    const slow = createChromeImageJudgeRepository({ api, fetchFn: () => new Promise(() => {}), timeoutMs: 20 });
    expect(await slow.judge(picture, context)).toBe('unknown');
  });

  it('downloads the model with progress from prepare()', async () => {
    const { api } = fakeLanguageModel({ availability: 'downloadable' });
    api.create = vi.fn(async ({ monitor }) => {
      const target = new EventTarget();
      monitor(target);
      target.dispatchEvent(Object.assign(new Event('downloadprogress'), { loaded: 0.4 }));
      return {};
    });
    const onProgress = vi.fn();

    expect(await createChromeImageJudgeRepository({ api }).prepare({ onProgress })).toEqual({ status: 'ok' });
    expect(onProgress).toHaveBeenCalledWith(0.4);
  });
});
