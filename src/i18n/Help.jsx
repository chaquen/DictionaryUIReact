import { createContext, useCallback, useContext, useMemo } from 'react';
import { DEFAULT_HELP_LANGUAGE, helpText } from './languages';

const HelpLanguageContext = createContext(DEFAULT_HELP_LANGUAGE);

/** Sets the help language (a code from `HELP_LANGUAGES` or `NO_HELP`). */
export function HelpLanguageProvider({ lang, children }) {
  return <HelpLanguageContext.Provider value={lang ?? DEFAULT_HELP_LANGUAGE}>{children}</HelpLanguageContext.Provider>;
}

/** `{ lang, help(id, vars) }`: `help` returns the help text or `null`. */
export function useHelp() {
  const lang = useContext(HelpLanguageContext);
  const help = useCallback((id, vars) => helpText(lang, id, vars), [lang]);
  return useMemo(() => ({ lang, help }), [lang, help]);
}

/**
 * English element followed by its help line (FR-017). The help is a sibling,
 * so the element keeps its English text and accessible name.
 *
 * @example <Bi id="learn.title" as="h1" className="h3">Learn new words</Bi>
 */
export function Bi({ id, vars, as: Tag = 'p', helpClassName = 'mb-2', children, ...rest }) {
  const { lang, help } = useHelp();
  const text = help(id, vars);
  return (
    <>
      <Tag {...rest}>{children}</Tag>
      {text && (
        <p className={`bi-help ${helpClassName}`} lang={lang}>
          {text}
        </p>
      )}
    </>
  );
}

/**
 * Help inline after a short English label, for buttons, links and badges:
 * "Learn it · La aprendo". Hidden from assistive technology so the control
 * keeps its English accessible name.
 */
export function BiLabel({ id, vars, children }) {
  const { lang, help } = useHelp();
  const text = help(id, vars);
  return (
    <>
      {children}
      {text && (
        <span className="bi-label-help" lang={lang} aria-hidden="true">
          {' · '}
          {text}
        </span>
      )}
    </>
  );
}

/** Help text alone, for places that already have their own layout (alerts, small notes). */
export function HelpLine({ id, vars, className = '' }) {
  const { lang, help } = useHelp();
  const text = help(id, vars);
  if (!text) return null;
  return (
    <span className={`bi-help d-block ${className}`} lang={lang}>
      {text}
    </span>
  );
}
