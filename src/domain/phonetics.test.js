import { describe, expect, it } from 'vitest';
import { SOUND_TIPS, firstDifference, sounds, spanishRespelling, syllables } from './phonetics';

describe('phonetics', () => {
  it('reads sounds and syllables from IPA', () => {
    expect(sounds('/stænd/')).toEqual(['s', 't', 'æ', 'n', 'd']);
    expect(sounds('/ˈwɔːtə/')).toEqual(['w', 'ɔː', 't', 'ə']);
    expect(syllables('/kənˈtɹoʊl/')).toEqual([
      { sounds: ['k', 'ə', 'n'], stressed: false },
      { sounds: ['t', 'ɹ', 'oʊ', 'l'], stressed: true },
    ]);
  });

  it('spells words the Spanish way, stressed syllable in capitals', () => {
    expect(spanishRespelling('/kənˈtɹoʊl/')).toBe('ken-TROUL');
    expect(spanishRespelling('/hoʊl/')).toBe('joul');
    expect(spanishRespelling('/həˈloʊ/')).toBe('je-LOU');
    expect(spanishRespelling('/ˈwɔːtə/')).toBe('UO-te');
    expect(spanishRespelling('/θɪŋk/')).toBe('zingk');
    expect(spanishRespelling('/stænd/')).toBe('st(a/e)nd');
    expect(spanishRespelling('')).toBeNull();
  });

  it('has a tip for the sounds that are hard for Spanish speakers', () => {
    expect(SOUND_TIPS['æ'].tip).toMatch(/between/);
    expect(SOUND_TIPS['θ'].id).toBe('th');
    expect(SOUND_TIPS.s).toBeUndefined();
  });

  it('finds the first sound that differs', () => {
    expect(firstDifference('/hoʊm/', '/hoʊl/')).toEqual({ kind: 'change', heard: 'm', target: 'l', where: 'end' });
    expect(firstDifference('/sænd/', '/stænd/')).toEqual({ kind: 'missing', target: 't', where: 'middle' });
    expect(firstDifference('/hoʊl/', '/hoʊl/')).toBeNull();
    expect(firstDifference('', '/hoʊl/')).toBeNull();
  });
});
