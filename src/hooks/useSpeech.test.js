import { describe, expect, it } from 'vitest';
import { pickBestVoice } from './useSpeech';

const voice = (name, lang = 'en-US') => ({ name, lang });

describe('pickBestVoice', () => {
  it('prefers neural/natural voices over default ones', () => {
    const best = pickBestVoice([
      voice('Fred'),
      voice('Samantha'),
      voice('Microsoft Aria Online (Natural) - English (United States)'),
      voice('Google US English'),
    ]);
    expect(best.name).toMatch(/Natural/);
  });

  it('prefers premium and Google voices over the system default', () => {
    expect(pickBestVoice([voice('Samantha'), voice('Google US English')]).name).toBe('Google US English');
    expect(pickBestVoice([voice('Google US English'), voice('Ava (Premium)')]).name).toBe('Ava (Premium)');
  });

  it('never picks novelty or non-English voices', () => {
    expect(
      pickBestVoice([voice('Zarvox'), voice('Bad News'), voice('Buenas noticias'), voice('Paulina', 'es-MX')]),
    ).toBeNull();
    expect(pickBestVoice([voice('Zarvox'), voice('Daniel', 'en-GB')]).name).toBe('Daniel');
  });

  it('ranks legacy robotic voices below any regular voice', () => {
    expect(pickBestVoice([voice('Fred'), voice('Ralph'), voice('Daniel', 'en-GB')]).name).toBe('Daniel');
  });

  it('returns null when no voices are loaded yet', () => {
    expect(pickBestVoice([])).toBeNull();
  });
});
