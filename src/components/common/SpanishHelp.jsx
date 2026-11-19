import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { Translate } from 'react-bootstrap-icons';
import { EventType, Idea } from '../../domain/learningEvent';
import { useLearning } from '../../context/LearningContext';
import { useRepositories } from '../../context/RepositoryContext';
import { BiLabel, HelpLine, useHelp } from '../../i18n/Help';
import { DEFAULT_HELP_LANGUAGE, helpLanguage } from '../../i18n/languages';

/**
 * Optional translation help (FR-016, ADR 2026-11-19): translates on the device
 * with Chrome's Translator API into the help language chosen in the Lab
 * (Spanish by default, also when the help line is off). Hidden when the idea
 * is turned off.
 */
export default function SpanishHelp({ text, term = null }) {
  const { translation } = useRepositories();
  const learning = useLearning();
  const { lang } = useHelp();
  const [state, setState] = useState({ status: 'idle' });

  if (!learning.isEnabled('translation') || !translation) return null;
  const target = helpLanguage(lang) ?? helpLanguage(DEFAULT_HELP_LANGUAGE);

  async function show() {
    setState({ status: 'loading', progress: null });
    const result = await translation.translate(text, 'en', target.code, {
      onProgress: (progress) => setState({ status: 'loading', progress }),
    });
    setState(result.status === 'ok' ? { status: 'done', text: result.text } : { status: 'error', ...result });
    if (result.status === 'ok') {
      await learning.record({ idea: Idea.TRANSLATION, type: EventType.TRANSLATION_SHOWN, term, meta: { to: target.code } });
    }
  }

  if (state.status === 'done') {
    return (
      <p className="text-success mb-2" lang={target.code}>
        <Translate className="me-1" aria-hidden="true" />
        {state.text}
      </p>
    );
  }

  const downloading = state.progress != null && state.progress < 1;
  const pct = Math.round((state.progress ?? 0) * 100);

  return (
    <div className="mb-2">
      <Button variant="link" size="sm" className="p-0" onClick={show} disabled={state.status === 'loading'}>
        {state.status === 'loading' ? (
          <>
            <Spinner size="sm" animation="border" className="me-1" aria-hidden="true" />
            {downloading ? (
              <BiLabel id="translate.downloading" vars={{ pct }}>
                Downloading translator {pct} %…
              </BiLabel>
            ) : (
              <BiLabel id="translate.working">Translating…</BiLabel>
            )}
          </>
        ) : (
          <>
            <Translate className="me-1" aria-hidden="true" />{' '}
            <BiLabel id="translate.show" vars={{ language: target.name.toLowerCase() }}>
              Show in {target.englishName}
            </BiLabel>
          </>
        )}
      </Button>
      {state.status === 'error' && (
        <small className="text-muted d-block">
          {state.message}
          <HelpLine id={state.code === 'unavailable' ? 'translate.unavailable' : 'translate.failed'} />
        </small>
      )}
    </div>
  );
}
