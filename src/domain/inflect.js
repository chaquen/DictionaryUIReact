/** Verbs that double their last consonant although they have two syllables (stress on the last one). */
const DOUBLE_FINAL = new Set([
  'admit', 'begin', 'commit', 'control', 'equip', 'forget', 'occur', 'patrol', 'permit', 'prefer',
  'refer', 'regret', 'submit', 'transfer', 'upset',
]);

/**
 * English "-ing" form of a verb: "stand" → "standing", "make" → "making",
 * "lie" → "lying", "run" → "running", "control" → "controlling".
 * Used to search pictures of the action instead of the noun ("stand" → a stand).
 *
 * @param {string} verb
 * @returns {string}
 */
export function presentParticiple(verb) {
  const v = verb.trim().toLowerCase();
  if (!v) return v;
  if (v.endsWith('ie')) return `${v.slice(0, -2)}ying`;
  if (/(ee|oe|ye)$/.test(v) || v === 'be') return `${v}ing`;
  if (v.endsWith('e') && v.length > 2) return `${v.slice(0, -1)}ing`;
  if (DOUBLE_FINAL.has(v) || /^[^aeiou]*[aeiou][^aeiouwxy]$/.test(v)) return `${v}${v.at(-1)}ing`;
  return `${v}ing`;
}

/** NGSL defines verbs as "to …" ("to be upright; not be sitting…"). */
export const isVerbDefinition = (definition) => /^to\s/i.test(definition ?? '');
