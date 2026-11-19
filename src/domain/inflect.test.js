import { describe, expect, it } from 'vitest';
import { isVerbDefinition, presentParticiple } from './inflect';

describe('presentParticiple', () => {
  it.each([
    ['stand', 'standing'],
    ['make', 'making'],
    ['lie', 'lying'],
    ['see', 'seeing'],
    ['run', 'running'],
    ['sit', 'sitting'],
    ['control', 'controlling'],
    ['determine', 'determining'],
    ['play', 'playing'],
    ['fix', 'fixing'],
    ['open', 'opening'],
    ['be', 'being'],
  ])('%s → %s', (verb, ing) => {
    expect(presentParticiple(verb)).toBe(ing);
  });
});

describe('isVerbDefinition', () => {
  it('detects NGSL verb definitions', () => {
    expect(isVerbDefinition('to be upright; not be sitting or lying down')).toBe(true);
    expect(isVerbDefinition('item that can be bought')).toBe(false);
    expect(isVerbDefinition(null)).toBe(false);
  });
});
