import { describe, expect, it } from 'vitest';
import { heardTheWord, words } from './pronunciation';

describe('pronunciation', () => {
  it('normalizes transcripts', () => {
    expect(words(' Stand. ')).toEqual(['stand']);
    expect(words("I don't KNOW!")).toEqual(['i', "don't", 'know']);
  });

  it('accepts the word only in the best guess, as a whole word', () => {
    expect(heardTheWord(['Stand.'], 'stand')).toBe(true);
    expect(heardTheWord(['I stand', 'sand'], 'stand')).toBe(true);
    expect(heardTheWord(['home', 'hole', 'whole'], 'whole')).toBe(false);
    expect(heardTheWord(['standard'], 'stand')).toBe(false);
    expect(heardTheWord([], 'stand')).toBe(false);
  });

  it('works with multi-word terms', () => {
    expect(heardTheWord(['ice cream please'], 'ice cream')).toBe(true);
  });
});
