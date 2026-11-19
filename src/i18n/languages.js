import es from './help.es.js';

/** No help line: the UI is shown in English only. */
export const NO_HELP = 'none';
export const DEFAULT_HELP_LANGUAGE = 'es';

/**
 * Help languages (FR-017). To add one: create `help.<code>.js` with the same
 * keys and add a row here. `englishName` is used in "Show in <language>".
 */
export const HELP_LANGUAGES = Object.freeze([
  { code: 'es', name: 'Español', englishName: 'Spanish', catalog: es },
]);

const byCode = new Map(HELP_LANGUAGES.map((l) => [l.code, l]));

/** The language entry for a code, or `null` for `NO_HELP` and unknown codes. */
export const helpLanguage = (code) => byCode.get(code) ?? null;

/**
 * The help text for `id` in language `code`, or `null` when there is no help
 * (help turned off, unknown language or missing key).
 */
export function helpText(code, id, vars = {}) {
  const value = helpLanguage(code)?.catalog[id];
  if (value === undefined) return null;
  return typeof value === 'function' ? value(vars) : value;
}
