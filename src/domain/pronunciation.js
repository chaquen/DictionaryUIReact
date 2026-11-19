/** Words of a transcript in lower case, without punctuation ("Stand." → ["stand"]). */
export const words = (text) =>
  (text ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

/**
 * Pronunciation check (#2, FR-002): the recognizer understood the word when
 * its best guess contains it as a whole word ("stand", "I stand"). Lower
 * guesses do not count: if "whole" only appears after "home", it was not
 * understood. Close words do not count either ("sand" is not "stand").
 *
 * @param {string[]} alternatives  Transcripts, best first.
 * @param {string} term
 */
export function heardTheWord(alternatives, term) {
  const target = words(term).join(' ');
  if (!target || alternatives.length === 0) return false;
  return ` ${words(alternatives[0]).join(' ')} `.includes(` ${target} `);
}
