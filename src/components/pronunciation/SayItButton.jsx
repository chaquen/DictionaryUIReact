import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { CheckCircleFill, MicFill, PlayFill, XCircleFill } from 'react-bootstrap-icons';
import { EventType, Idea } from '../../domain/learningEvent';
import { firstDifference } from '../../domain/phonetics';
import { heardTheWord, words } from '../../domain/pronunciation';
import { LookupStatus } from '../../domain/word';
import { useRepositories } from '../../context/RepositoryContext';
import { useSpeech } from '../../hooks/useSpeech';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useLearning } from '../../context/LearningContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { BiLabel, HelpLine } from '../../i18n/Help';

const ERRORS = {
  'not-allowed': { text: 'Allow the microphone to practise.', help: 'say.error.mic' },
  'service-not-allowed': { text: 'Allow the microphone to practise.', help: 'say.error.mic' },
  'audio-capture': { text: 'No microphone was found.', help: 'say.error.noMic' },
  'no-speech': { text: "I didn't hear anything. Try again.", help: 'say.error.silence' },
  timeout: { text: "I didn't hear anything. Try again.", help: 'say.error.silence' },
  network: { text: 'Speech recognition needs a connection in this browser.', help: 'say.error.network' },
  'install-failed': {
    text: "On-device recognition isn't available here. Press the button again to use Google's service.",
    help: 'say.error.install',
  },
};
const GENERIC_ERROR = { text: 'Something went wrong. Try again.', help: 'say.error.generic' };

/**
 * Pronunciation practice (#2, FR-002, US-004): say the word aloud and see
 * whether it was understood. Every attempt is recorded (signal: ≥ 2 attempts
 * per practised word). Hidden when the idea is off or the browser cannot
 * recognize speech (FR-011).
 *
 * `onAvailable(boolean)` tells whether the button can be used here;
 * `onAttempt({ correct } | { error })` reports each attempt.
 *
 * When the word is not understood it shows the pronunciation of what was
 * heard and the first sound that differs (`phonetic` = the word's IPA).
 * Each attempt is recorded locally to compare it with the native audio.
 */
export default function SayItButton({ term, phonetic = null, audioUrl = null, source = 'learn', speechApi, onAvailable, onAttempt }) {
  const learning = useLearning();
  const { wordLookup } = useRepositories();
  const speak = useSpeech();
  const recorder = useVoiceRecorder();
  const { mode, listen } = useSpeechRecognition(speechApi === undefined ? {} : { api: speechApi });
  const [state, setState] = useState({ status: 'idle' });
  const usable = learning.isEnabled('pronunciation') && mode !== 'unavailable' && mode !== 'checking';
  const known = mode !== 'checking';

  useEffect(() => {
    if (known) onAvailable?.(usable);
  }, [known, usable, onAvailable]);

  if (!usable) return null;

  async function sayIt() {
    setState({ status: 'listening' });
    const listening = listen({ onInstalling: () => setState({ status: 'installing' }) });
    const stopRecording = await recorder.start();
    const result = await listening;
    await stopRecording();
    if (result.status !== 'ok') {
      setState({ status: 'error', ...(ERRORS[result.code] ?? GENERIC_ERROR) });
      onAttempt?.({ error: result.code });
      return;
    }
    const correct = heardTheWord(result.alternatives, term);
    const heard = result.alternatives[0] ?? '';
    setState({ status: correct ? 'correct' : 'wrong', heard });
    onAttempt?.({ correct });
    if (!correct && phonetic && words(heard).length === 1 && wordLookup) {
      const lookup = await wordLookup.findByTerm(words(heard)[0]).catch(() => null);
      const heardIpa = lookup?.status === LookupStatus.FOUND ? lookup.word.phonetic : null;
      const diff = heardIpa ? firstDifference(heardIpa, phonetic) : null;
      setState((s) => (s.heard === heard ? { ...s, heardIpa, diff } : s));
    }
    await learning.record({
      idea: Idea.PRONUNCIATION,
      type: EventType.PRONUNCIATION_ATTEMPT,
      term,
      correct,
      meta: { heard: result.alternatives[0] ?? '', alternatives: result.alternatives, local: result.local, source },
    });
  }

  const busy = state.status === 'listening' || state.status === 'installing';

  return (
    <div className="say-it mb-2" data-testid="say-it">
      <Button variant="outline-primary" size="sm" onClick={sayIt} disabled={busy}>
        {busy ? (
          <Spinner size="sm" animation="grow" className="me-1" aria-hidden="true" />
        ) : (
          <MicFill className="me-1" aria-hidden="true" />
        )}
        {state.status === 'installing' ? (
          <BiLabel id="say.installing">Downloading the speech model…</BiLabel>
        ) : state.status === 'listening' ? (
          <BiLabel id="say.listening" vars={{ term }}>
            Listening… say &quot;{term}&quot;
          </BiLabel>
        ) : state.status === 'idle' ? (
          <BiLabel id="say.button">Say it</BiLabel>
        ) : (
          <BiLabel id="say.again">Try again</BiLabel>
        )}
      </Button>

      {state.status === 'correct' && (
        <span className="text-success ms-2" role="status">
          <CheckCircleFill className="me-1" aria-hidden="true" />
          Well said! I heard &quot;{state.heard}&quot;.
          <HelpLine id="say.correct" />
        </span>
      )}
      {state.status === 'wrong' && (
        <span className="text-danger ms-2" role="status">
          <XCircleFill className="me-1" aria-hidden="true" />
          I heard &quot;{state.heard || '…'}&quot;. Listen and try again.
          <HelpLine id="say.wrong" />
        </span>
      )}
      {state.status === 'wrong' && state.heardIpa && (
        <div className="small mt-1" data-testid="pronunciation-diff">
          <div>
            <span className="text-muted">{state.heard}</span> {state.heardIpa} · <strong>{term}</strong> {phonetic}
          </div>
          {state.diff && <DiffText diff={state.diff} />}
        </div>
      )}
      {recorder.url && (state.status === 'correct' || state.status === 'wrong') && (
        <div className="small mt-1 d-flex flex-wrap align-items-center gap-2">
          <BiLabel id="say.compare">Compare your voice with the recording:</BiLabel>
          <Button variant="outline-secondary" size="sm" className="py-0" onClick={() => new Audio(recorder.url).play()}>
            <PlayFill aria-hidden="true" /> <BiLabel id="say.yourVoice">Your voice</BiLabel>
          </Button>
          <Button variant="outline-secondary" size="sm" className="py-0" onClick={() => speak({ text: term, audioUrl })}>
            <PlayFill aria-hidden="true" /> <BiLabel id="say.native">Native</BiLabel>
          </Button>
        </div>
      )}
      {state.status === 'error' && (
        <span className="text-muted ms-2" role="status">
          {state.text}
          <HelpLine id={state.help} />
        </span>
      )}
      {mode === 'cloud' && (
        <small className="text-muted d-block mt-1">
          In this browser your voice is sent to Google to be recognized.
          <HelpLine id="say.cloud" />
        </small>
      )}
    </div>
  );
}

const WHERE_EN = { start: 'at the start', middle: 'in the middle', end: 'at the end' };
const WHERE_ES = { start: 'al principio', middle: 'en medio', end: 'al final' };

/** "Say /l/ instead of /m/ at the end." with its Spanish help. */
function DiffText({ diff }) {
  const vars = { target: diff.target, heard: diff.heard, where: WHERE_ES[diff.where] };
  const where = WHERE_EN[diff.where];
  return (
    <div className="text-danger">
      {diff.kind === 'change' && `Say /${diff.target}/ instead of /${diff.heard}/ ${where}.`}
      {diff.kind === 'missing' && `You missed the /${diff.target}/ sound ${where}.`}
      {diff.kind === 'extra' && `There is an extra /${diff.heard}/ sound ${where}.`}
      <HelpLine id={`say.diff.${diff.kind}`} vars={vars} />
    </div>
  );
}
