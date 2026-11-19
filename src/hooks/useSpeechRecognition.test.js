import { afterEach, describe, expect, it } from 'vitest';
import { createFakeSpeechRecognition } from '../test/fakeSpeech';
import { LOCAL_FAILED_KEY, speechRecognitionMode } from './useSpeechRecognition';

describe('speechRecognitionMode', () => {
  afterEach(() => localStorage.removeItem(LOCAL_FAILED_KEY));

  it('goes to the service when the on-device download failed recently, and retries a day later', async () => {
    const api = createFakeSpeechRecognition({ availability: 'downloadable' });
    localStorage.setItem(LOCAL_FAILED_KEY, String(Date.now() - 60_000));
    expect(await speechRecognitionMode(api, 'en-US')).toBe('cloud');

    localStorage.setItem(LOCAL_FAILED_KEY, String(Date.now() - 25 * 60 * 60 * 1000));
    expect(await speechRecognitionMode(api, 'en-US')).toBe('downloadable');
  });

  it('prefers on-device recognition', async () => {
    const api = createFakeSpeechRecognition({ availability: 'available' });
    expect(await speechRecognitionMode(api, 'en-US')).toBe('local');
    expect(api.available).toHaveBeenCalledWith({ langs: ['en-US'], processLocally: true });
  });

  it('reports downloadable packs, cloud-only browsers and no support', async () => {
    expect(await speechRecognitionMode(createFakeSpeechRecognition({ availability: 'downloadable' }), 'en-US')).toBe('downloadable');
    expect(await speechRecognitionMode(createFakeSpeechRecognition({ availability: 'unavailable' }), 'en-US')).toBe('cloud');
    expect(await speechRecognitionMode(class Old {}, 'en-US')).toBe('cloud');
    expect(await speechRecognitionMode(null, 'en-US')).toBe('unavailable');
  });
});
