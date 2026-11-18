import { describe, expect, it } from 'vitest';
import { mapEntriesToWord } from './freeDictionaryMapper';
import hello from './__fixtures__/hello.json';
import bank from './__fixtures__/bank.json';

describe('mapEntriesToWord', () => {
  it('maps a single entry into the domain model', () => {
    const word = mapEntriesToWord(hello);

    expect(word.word).toBe('hello');
    expect(word.phonetic).toBe('/həˈləʊ/');
    expect(word.audioUrl).toMatch(/hello-au\.mp3$/);
    expect(word.meanings.map((m) => m.partOfSpeech)).toEqual(['noun', 'verb', 'interjection']);
    expect(word.meanings[0]).toMatchObject({
      synonyms: ['greeting'],
      definitions: [{ text: '"Hello!" or an equivalent greeting.', example: null }],
    });
    expect(word.meanings[2].definitions[0].example).toEqual(expect.any(String));
  });

  it('merges several entries (etymologies) into one word', () => {
    const word = mapEntriesToWord(bank);

    expect(word.word).toBe('bank');
    expect(word.phonetic).toBe('/bæŋk/');
    expect(word.audioUrl).toMatch(/bank-us\.mp3$/);
    expect(word.meanings).toHaveLength(4);
    expect(word.sourceUrls).toEqual(['https://en.wiktionary.org/wiki/bank']);
  });

  it('collects definition-level synonyms without duplicates', () => {
    const word = mapEntriesToWord([
      {
        word: 'fast',
        phonetics: [],
        meanings: [
          {
            partOfSpeech: 'adjective',
            synonyms: ['quick'],
            antonyms: [],
            definitions: [{ definition: 'Moving quickly.', synonyms: ['quick', 'rapid'], antonyms: ['slow'] }],
          },
        ],
      },
    ]);

    expect(word.meanings[0].synonyms).toEqual(['quick', 'rapid']);
    expect(word.meanings[0].antonyms).toEqual(['slow']);
    expect(word.phonetic).toBeNull();
    expect(word.audioUrl).toBeNull();
  });

  it('rejects payloads that are not an array of entries', () => {
    expect(() => mapEntriesToWord({ title: 'No Definitions Found' })).toThrow(TypeError);
    expect(() => mapEntriesToWord([])).toThrow(TypeError);
  });
});
