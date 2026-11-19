import { addDays, dayKey } from './learningEvent';
import { normalizeTerm } from './word';

/**
 * Essential vocabulary path (#19): propose the most useful words first,
 * skip the ones the user already knows and measure text coverage.
 *
 * @typedef {{ term: string, rank: number, perMillion: number, definition: string }} VocabularyEntry
 * @typedef {{ placement: { startRank: number, completedAt: string } | null,
 *             known: string[], learnedByDay: Record<string, string[]>, extraByDay: Record<string, number> }} LearningPathState
 */

/** The most frequent words (mostly grammar words like "the", "be", "and") count as known (S7). */
export const KNOWN_BY_DEFAULT_RANK = 100;

/** A word is mastered when FSRS-6 estimates it would be remembered for 21+ days (S9). */
export const MASTERY_STABILITY_DAYS = 21;

export const PLACEMENT_BANDS = Object.freeze([
  [101, 300],
  [301, 700],
  [701, 1200],
  [1201, 1800],
  [1801, 2400],
  [2401, 2809],
]);

export const emptyPathState = () => ({ placement: null, known: [], learnedByDay: {}, extraByDay: {} });

/** `perBand` words evenly spread across each frequency band (deterministic). */
export function placementSample(list, perBand = 5, bands = PLACEMENT_BANDS) {
  return bands.map(([from, to]) => {
    const band = list.filter((w) => w.rank >= from && w.rank <= to && w.definition);
    const step = band.length / perBand;
    const words = Array.from({ length: Math.min(perBand, band.length) }, (_, i) => band[Math.floor(i * step + step / 2)]);
    return { from, to, words };
  });
}

/**
 * Where the path should start: the first band in which the user knows
 * fewer than 60 % of the sampled words.
 *
 * @param {{ from: number, to: number, words: VocabularyEntry[] }[]} sample
 * @param {Set<string>} knownTerms  Terms the user said they know
 */
export function estimateStart(sample, knownTerms, threshold = 0.6) {
  for (const band of sample) {
    const known = band.words.filter((w) => knownTerms.has(w.term)).length;
    if (band.words.length === 0 || known / band.words.length < threshold) return band.from;
  }
  return sample.length ? sample[sample.length - 1].to + 1 : KNOWN_BY_DEFAULT_RANK + 1;
}

export const isMastered = (card) => (card?.fsrsShadow?.stability ?? 0) >= MASTERY_STABILITY_DAYS;

/** Terms the user knows or has mastered, including those below the placement start. */
export function coveredTerms(list, state, cards = []) {
  const startRank = Math.max(KNOWN_BY_DEFAULT_RANK + 1, state.placement?.startRank ?? 0);
  const covered = new Set(state.known.map(normalizeTerm));
  for (const w of list) if (w.rank < startRank) covered.add(w.term);
  for (const card of cards) if (isMastered(card)) covered.add(normalizeTerm(card.term));
  return covered;
}

/** Share (0–1) of the words in an everyday English text that the covered terms represent. */
export function coverage(list, covered) {
  const total = list.reduce((sum, w) => sum + w.perMillion, 0);
  if (total === 0) return 0;
  const part = list.reduce((sum, w) => sum + (covered.has(w.term) ? w.perMillion : 0), 0);
  // perMillion is per million words of text; the NGSL covers ~85 % of it, so divide by 1M, not by `total`.
  return Math.min(1, part / 1_000_000);
}

/** How many new words the user can still learn today. */
export function remainingToday(state, quota, now) {
  const today = dayKey(now);
  const learned = state.learnedByDay[today]?.length ?? 0;
  return Math.max(0, quota + (state.extraByDay[today] ?? 0) - learned);
}

/**
 * Next words to propose: most frequent first, from the placement start,
 * skipping known and already saved words.
 */
export function nextNewWords(list, state, savedTerms, count) {
  if (count <= 0) return [];
  const startRank = Math.max(KNOWN_BY_DEFAULT_RANK + 1, state.placement?.startRank ?? 0);
  const skip = new Set([...state.known, ...savedTerms].map(normalizeTerm));
  const words = [];
  for (const w of list) {
    if (w.rank >= startRank && !skip.has(w.term)) words.push(w);
    if (words.length === count) break;
  }
  return words;
}

/** Number of distinct days with learned words in the last `days` days (for the Lab). */
export function learnedInLastDays(state, now, days = 7) {
  let total = 0;
  for (let i = 0; i < days; i += 1) total += state.learnedByDay[dayKey(addDays(now, -i))]?.length ?? 0;
  return total;
}
