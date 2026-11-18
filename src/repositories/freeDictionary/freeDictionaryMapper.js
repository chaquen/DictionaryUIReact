/**
 * Translates Free Dictionary API responses (https://dictionaryapi.dev)
 * into the domain `Word` model. Nothing outside this folder knows the
 * shape of that API.
 *
 * @typedef {import('../../domain/word').Word} Word
 * @typedef {import('../../domain/word').Meaning} Meaning
 */

const unique = (values) => [...new Set(values.filter(Boolean))];

function pickPhonetic(entries) {
  for (const entry of entries) {
    if (entry.phonetic) return entry.phonetic;
    const withText = (entry.phonetics ?? []).find((p) => p.text);
    if (withText) return withText.text;
  }
  return null;
}

/** Prefers the US recording, then any recording available. */
function pickAudio(entries) {
  const audios = entries
    .flatMap((entry) => entry.phonetics ?? [])
    .map((p) => p.audio)
    .filter(Boolean);
  return audios.find((url) => /-us\.mp3$/.test(url)) ?? audios[0] ?? null;
}

/** @returns {Meaning} */
function mapMeaning(meaning) {
  const definitions = meaning.definitions ?? [];
  return {
    partOfSpeech: meaning.partOfSpeech ?? 'unknown',
    definitions: definitions.map((d) => ({
      text: d.definition,
      example: d.example ?? null,
    })),
    synonyms: unique([
      ...(meaning.synonyms ?? []),
      ...definitions.flatMap((d) => d.synonyms ?? []),
    ]),
    antonyms: unique([
      ...(meaning.antonyms ?? []),
      ...definitions.flatMap((d) => d.antonyms ?? []),
    ]),
  };
}

/**
 * The API returns one entry per etymology (e.g. "bank" has several).
 * They are merged into a single word.
 *
 * @param {Array<Object>} entries
 * @returns {Word}
 */
export function mapEntriesToWord(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new TypeError('Expected a non-empty array of dictionary entries');
  }
  return {
    word: entries[0].word,
    phonetic: pickPhonetic(entries),
    audioUrl: pickAudio(entries),
    meanings: entries.flatMap((entry) => (entry.meanings ?? []).map(mapMeaning)),
    sourceUrls: unique(entries.flatMap((entry) => entry.sourceUrls ?? [])),
  };
}
