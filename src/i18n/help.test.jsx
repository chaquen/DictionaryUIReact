import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../domain/gamification';
import { IDEAS } from '../domain/ideas';
import { GRADES, STRATEGIES } from '../domain/scheduling';
import { Bi, BiLabel, HelpLanguageProvider } from './Help';
import es from './help.es.js';
import { NO_HELP, helpText } from './languages';

/** Every `id="…"` used with <Bi>, <BiLabel> or <HelpLine> in the app's source. */
function staticKeysInSource() {
  const sources = import.meta.glob(['../**/*.jsx', '!../**/*.test.jsx'], { query: '?raw', import: 'default', eager: true });
  const keys = new Set();
  for (const source of Object.values(sources)) {
    for (const match of source.matchAll(/<(?:Bi|BiLabel|HelpLine)\b[^>]*?\bid="([^"]+)"/g)) keys.add(match[1]);
  }
  return keys;
}

describe('Spanish help catalog (FR-017)', () => {
  it('has every key used by the screens', () => {
    const keys = staticKeysInSource();
    expect(keys.size).toBeGreaterThan(40);
    expect([...keys].filter((k) => !(k in es))).toEqual([]);
  });

  it('has the keys built from domain catalogs', () => {
    const dynamic = [
      ...GRADES.map((g) => `grade.${g.value}`),
      ...ACHIEVEMENTS.map((a) => `achievement.${a.id}`),
      ...IDEAS.map((i) => `idea.${i.id}`),
      ...STRATEGIES.map((s) => `strategy.${s.id}`),
      // Keys chosen with expressions in the screens
      'translate.unavailable',
      'translate.failed',
      'lab.exported',
      'lab.exportFailed',
    ];
    expect(dynamic.filter((k) => !(k in es))).toEqual([]);
  });

  it('handles plurals and missing keys', () => {
    expect(helpText('es', 'home.review.due', { n: 1 })).toBe('Tienes 1 palabra para repasar hoy.');
    expect(helpText('es', 'home.review.due', { n: 3 })).toBe('Tienes 3 palabras para repasar hoy.');
    expect(helpText('es', 'missing.key')).toBeNull();
    expect(helpText(NO_HELP, 'nav.home')).toBeNull();
  });
});

describe('<Bi> and <BiLabel>', () => {
  it('show the English text with the help, keeping the English accessible name', () => {
    render(
      <HelpLanguageProvider lang="es">
        <Bi id="learn.title" as="h1">
          Learn new words
        </Bi>
        <button type="button">
          <BiLabel id="learn.learnIt">Learn it</BiLabel>
        </button>
      </HelpLanguageProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Learn new words' })).toBeInTheDocument();
    expect(screen.getByText('Aprende palabras nuevas')).toHaveAttribute('lang', 'es');
    expect(screen.getByRole('button', { name: 'Learn it' })).toHaveTextContent('Learn it · La aprendo');
  });

  it('show only English when the help is off', () => {
    render(
      <HelpLanguageProvider lang={NO_HELP}>
        <Bi id="learn.title" as="h1">
          Learn new words
        </Bi>
      </HelpLanguageProvider>,
    );
    expect(screen.queryByText('Aprende palabras nuevas')).not.toBeInTheDocument();
  });
});
