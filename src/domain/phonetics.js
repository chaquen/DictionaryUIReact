/**
 * Pronunciation aids for Spanish speakers (#2): reads an IPA transcription
 * from the dictionary ("/kənˈtɹoʊl/"), spells it the Spanish way
 * ("ken-TROUL"), explains the hard sounds and compares two pronunciations.
 * Rule-based: approximate by design, no external services.
 */

/** Sound → Spanish-readable spelling. Longest symbols first when reading. */
const RESPELL = {
  // Diphthongs and long vowels
  eɪ: 'ei', aɪ: 'ai', ɔɪ: 'oi', aʊ: 'au', oʊ: 'ou', əʊ: 'ou', ɪə: 'ia', eə: 'ea', ɛə: 'ea', ʊə: 'ua',
  iː: 'i', uː: 'u', ɑː: 'a', ɔː: 'o', ɜː: 'er', 'ɝ': 'er', 'ɚ': 'er', 'ɜ': 'er',
  // Short vowels
  i: 'i', ɪ: 'i', 'ᵻ': 'i', e: 'e', ɛ: 'e', æ: '(a/e)', ʌ: 'a', ɑ: 'a', ɒ: 'o', ɔ: 'o', o: 'o', ʊ: 'u', u: 'u', ə: 'e', a: 'a',
  // Consonants
  tʃ: 'ch', dʒ: 'y', p: 'p', b: 'b', t: 't', d: 'd', k: 'k', g: 'g', ɡ: 'g', f: 'f', v: 'v', θ: 'z', ð: 'd',
  s: 's', z: 's', ʃ: 'sh', ʒ: 'sh', h: 'j', m: 'm', n: 'n', ŋ: 'ng', l: 'l', ɫ: 'l', ɹ: 'r', r: 'r', ɾ: 'r',
  w: 'u', j: 'y', x: 'j',
};
const SYMBOLS = Object.keys(RESPELL).sort((a, b) => b.length - a.length);
const STRESS = new Set(['ˈ', "'"]);
const BOUNDARY = new Set(['ˈ', 'ˌ', '.', "'"]);

/**
 * Sounds of an IPA transcription grouped by syllable, when the transcription
 * marks syllables (stress marks or dots).
 * @returns {{ sounds: string[], stressed: boolean }[]}
 */
export function syllables(ipa) {
  const text = (ipa ?? '').normalize('NFD').replace(/[/[\]()\s̀-ͯ]/g, '');
  const result = [{ sounds: [], stressed: false }];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (BOUNDARY.has(char)) {
      if (result.at(-1).sounds.length) result.push({ sounds: [], stressed: false });
      if (STRESS.has(char)) result.at(-1).stressed = true;
      i += 1;
      continue;
    }
    if (char === 'ː') {
      i += 1;
      continue;
    }
    const symbol = SYMBOLS.find((s) => text.startsWith(s, i));
    if (symbol) {
      // Keep the length mark with its vowel ("iː").
      const long = text[i + symbol.length] === 'ː' && RESPELL[`${symbol}ː`] ? `${symbol}ː` : symbol;
      result.at(-1).sounds.push(long);
      i += long.length;
    } else {
      i += 1; // Unknown marks (glottal stop, diacritics) are skipped.
    }
  }
  return result.filter((s) => s.sounds.length).flatMap(splitSyllable);
}

const VOWELS = new Set(['eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'oʊ', 'əʊ', 'ɪə', 'eə', 'ɛə', 'ʊə', 'iː', 'uː', 'ɑː', 'ɔː', 'ɜː', 'ɝ', 'ɚ', 'ɜ',
  'i', 'ɪ', 'ᵻ', 'e', 'ɛ', 'æ', 'ʌ', 'ɑ', 'ɒ', 'ɔ', 'o', 'ʊ', 'u', 'ə', 'a']);
/** Consonant pairs that start a syllable together ("tr", "pl", "st"…). */
const ONSETS = /^(?:[pbtdkgɡf][ɹrl]|s[ptkmnlw]|θɹ|ʃɹ)$/;

/** Splits a block with several vowels: V-CV, VC-CV, keeping onset clusters together ("wɔː-tə", "ˈæp-l"). */
function splitSyllable({ sounds: list, stressed }) {
  const nuclei = list.map((sound, i) => (VOWELS.has(sound) ? i : -1)).filter((i) => i >= 0);
  if (nuclei.length < 2) return [{ sounds: list, stressed }];
  const cuts = [];
  for (let n = 1; n < nuclei.length; n += 1) {
    const between = nuclei[n] - nuclei[n - 1] - 1;
    const last = nuclei[n];
    if (between <= 1) cuts.push(last - between);
    else cuts.push(ONSETS.test(list[last - 2] + list[last - 1]) ? last - 2 : last - 1);
  }
  const parts = [];
  let start = 0;
  for (const cut of [...cuts, list.length]) {
    parts.push({ sounds: list.slice(start, cut), stressed: stressed && start === 0 });
    start = cut;
  }
  return parts;
}

/** All the sounds of a transcription, in order. */
export const sounds = (ipa) => syllables(ipa).flatMap((s) => s.sounds);

/**
 * Spanish-style spelling: syllables joined with "-" and the stressed one in
 * capitals ("/kənˈtɹoʊl/" → "ken-TROUL", "/hoʊl/" → "joul").
 */
export function spanishRespelling(ipa) {
  const parts = syllables(ipa);
  if (parts.length === 0) return null;
  const many = parts.length > 1;
  return parts
    .map(({ sounds: s, stressed }) => {
      const text = s.map((sound) => RESPELL[sound] ?? '').join('');
      return many && stressed ? text.toUpperCase() : text;
    })
    .join('-');
}

/** Sounds that do not exist (or differ) in Spanish, with how to make them. Keys: help catalog `sound.<id>`. */
export const SOUND_TIPS = Object.freeze({
  æ: { id: 'ae', tip: 'Open your mouth as for "a", but say "e". It is between the two.' },
  ʌ: { id: 'uh', tip: 'A short, relaxed "a", with the mouth half open.' },
  ə: { id: 'schwa', tip: 'A weak, very short vowel, like a lazy "e". Never stressed.' },
  ɪ: { id: 'ih', tip: 'A short, relaxed "i", between "i" and "e".' },
  iː: { id: 'ee', tip: 'A long "i": smile and hold it.' },
  ʊ: { id: 'oo', tip: 'A short, relaxed "u", with the lips barely rounded.' },
  uː: { id: 'ooo', tip: 'A long "u": round the lips and hold it.' },
  ɜː: { id: 'er', tip: 'Like "e" with the tongue pulled back, almost "er", without rolling.' },
  'ɝ': { id: 'er', tip: 'Like "e" with the tongue pulled back, almost "er", without rolling.' },
  'ɚ': { id: 'er', tip: 'Like "e" with the tongue pulled back, almost "er", without rolling.' },
  θ: { id: 'th', tip: 'Tongue between the teeth and blow, like the "z" of Spain.' },
  ð: { id: 'dh', tip: 'Tongue between the teeth with voice, like a soft "d" ("nada").' },
  ʃ: { id: 'sh', tip: 'Like asking for silence: "shh".' },
  ʒ: { id: 'zh', tip: 'Like "sh" but with voice, as in "measure".' },
  h: { id: 'h', tip: 'A soft breath, much softer than the Spanish "j".' },
  v: { id: 'v', tip: 'Upper teeth on the lower lip, with voice. Not like "b".' },
  z: { id: 'z', tip: 'A buzzing "s", with voice, like a bee.' },
  ɹ: { id: 'r', tip: 'The tongue does not touch the roof of the mouth. Never rolled.' },
  ŋ: { id: 'ng', tip: 'Like the "n" in "tengo", from the back. The "g" is not heard.' },
  dʒ: { id: 'j', tip: 'Like a strong "ll/y" of Argentina with a "d" before: "dy".' },
  w: { id: 'w', tip: 'Round the lips as for "u" and open quickly.' },
});

const WHERE = (index, length) => (index === 0 ? 'start' : index >= length - 1 ? 'end' : 'middle');

/**
 * First difference between what was heard and the word, sound by sound
 * (edit-distance alignment). Null when they sound the same.
 * @returns {null | { kind: 'change' | 'missing' | 'extra', target?: string, heard?: string, where: 'start'|'middle'|'end' }}
 */
export function firstDifference(heardIpa, targetIpa) {
  const a = sounds(heardIpa);
  const b = sounds(targetIpa);
  if (a.length === 0 || b.length === 0) return null;
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  // Walk back to collect the operations, then report the first one.
  const ops = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      i -= 1;
      j -= 1;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      ops.push({ kind: 'change', heard: a[i - 1], target: b[j - 1], at: j - 1 });
      i -= 1;
      j -= 1;
    } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
      ops.push({ kind: 'missing', target: b[j - 1], at: j - 1 });
      j -= 1;
    } else {
      ops.push({ kind: 'extra', heard: a[i - 1], at: Math.max(0, j - 1) });
      i -= 1;
    }
  }
  const first = ops.at(-1);
  if (!first) return null;
  const { at, ...rest } = first;
  return { ...rest, where: WHERE(at, b.length) };
}
