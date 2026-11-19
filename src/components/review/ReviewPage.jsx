import { useCallback, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { firstDefinition, normalizeTerm } from '../../domain/word';
import { GRADES, getStrategy } from '../../domain/scheduling';
import { useLearning } from '../../context/LearningContext';
import { Bi, BiLabel, HelpLine, useHelp } from '../../i18n/Help';
import { helpLanguage } from '../../i18n/languages';
import { whenText } from '../../utils/relativeTime';
import SpanishHelp from '../common/SpanishHelp';
import PronounceButton from '../PronounceButton';
import PhoneticHelp from '../pronunciation/PhoneticHelp';
import SayItButton from '../pronunciation/SayItButton';
import WordDetails from '../WordDetails';

/** Attempts that end like this unlock grading: the user cannot speak to the app. */
const CANNOT_SPEAK = new Set(['not-allowed', 'service-not-allowed', 'audio-capture']);


/** Spaced-repetition review (#1): recall the meaning, reveal it, grade yourself. */
export default function ReviewPage({ savedWords }) {
  const learning = useLearning();
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ reviewed: 0, correct: 0 });
  const [busy, setBusy] = useState(false);
  // Grading is unlocked by saying the word (#2), unless speech cannot be used here.
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [said, setSaid] = useState(false);
  const onSpeechAvailable = useCallback((available) => setSpeechAvailable(available), []);
  const onAttempt = useCallback((attempt) => {
    if ('correct' in attempt || CANNOT_SPEAK.has(attempt.error)) setSaid(true);
  }, []);
  const locked = speechAvailable && !said;
  const { lang } = useHelp();
  const helpLocale = helpLanguage(lang)?.code ?? 'en-US';
  const terms = savedWords.words.map((w) => w.word);
  const due = learning.dueCardsNow(terms);
  const next = due.length === 0 ? learning.nextDue(terms) : null;

  // Re-render every 30 s (for the relative time) and right when the next word becomes due (e.g. 1 minute after "Again").
  const [, setTick] = useState(0);
  const nextAt = next?.getTime() ?? null;
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    const wait = nextAt === null ? null : Math.max(0, nextAt - learning.now().getTime()) + 250;
    const timer = wait === null || wait > 2 ** 31 - 1 ? null : setTimeout(() => setTick((t) => t + 1), wait);
    return () => {
      clearInterval(id);
      if (timer) clearTimeout(timer);
    };
  }, [nextAt, learning]);
  const card = due[0];
  const word = card && savedWords.words.find((w) => normalizeTerm(w.word) === normalizeTerm(card.term));

  async function grade(value) {
    setBusy(true);
    await learning.rate(card.term, value);
    setSession((s) => ({ reviewed: s.reviewed + 1, correct: s.correct + (value > 1 ? 1 : 0) }));
    setRevealed(false);
    setSaid(false);
    setBusy(false);
  }

  if (savedWords.words.length === 0) {
    return (
      <Alert variant="info">
        You have no saved words yet. <Link to="/search">Search and save</Link> some to start reviewing.
        <HelpLine id="review.noWords" />
      </Alert>
    );
  }

  if (!card || !word) {
    const now = learning.now();
    return (
      <section aria-label="Review">
        <Alert variant="success">
          <Bi id="review.allDone" as={Alert.Heading} className="h5 mb-0">
            All caught up!
          </Bi>
          {session.reviewed > 0 && (
            <Bi id="review.summary" vars={{ n: session.reviewed, correct: session.correct }} className="mb-0">
              You reviewed {session.reviewed} {session.reviewed === 1 ? 'word' : 'words'} and remembered {session.correct}.
            </Bi>
          )}
          {next ? (
            <Bi id="review.next" vars={{ date: whenText(next, now, helpLocale) }} className="mb-0" helpClassName="mb-0">
              Next review: {whenText(next, now, 'en-US')}
            </Bi>
          ) : (
            <Bi id="review.noneScheduled" className="mb-0" helpClassName="mb-0">
              No reviews scheduled.
            </Bi>
          )}
        </Alert>
      </section>
    );
  }

  const strategy = getStrategy(card.strategy);

  return (
    <section aria-label="Review">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          <BiLabel id="review.left" vars={{ n: due.length, done: session.reviewed }}>
            {due.length} left {session.reviewed > 0 && `· ${session.reviewed} done`}
          </BiLabel>
        </span>
        <Badge bg="light" text="dark" className="border" title={strategy.description}>
          {strategy.name}
          {card.state?.box ? ` · box ${card.state.box}` : ''}
        </Badge>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="h3 text-capitalize mb-1">
            <PronounceButton text={word.word} audioUrl={word.audioUrl} size={24} />
            {word.word}
          </h2>
          <PhoneticHelp term={word.word} ipa={word.phonetic} audioUrl={word.audioUrl} />
          <SayItButton
            key={word.word}
            term={word.word}
            phonetic={word.phonetic}
            audioUrl={word.audioUrl}
            source="review"
            onAvailable={onSpeechAvailable}
            onAttempt={onAttempt}
          />

          <Bi id="review.question" className="mt-3 mb-0">
            Do you remember what it means? Rate yourself, or check the answer first.
          </Bi>
          {locked && (
            <Bi id="review.sayFirst" className="small text-muted mb-1">
              Say the word first to rate yourself.
            </Bi>
          )}
          <div className="d-flex flex-wrap gap-2" role="group" aria-label="Rate your answer">
            {GRADES.map((g) => (
              <Button
                key={g.value}
                variant={g.value === 1 ? 'outline-danger' : 'outline-primary'}
                title={g.hint}
                disabled={busy || locked}
                onClick={() => grade(g.value)}
              >
                <BiLabel id={`grade.${g.value}`}>{g.label}</BiLabel>
              </Button>
            ))}
          </div>

          {!revealed ? (
            <Button variant="link" className="px-0 mt-2" onClick={() => setRevealed(true)}>
              <BiLabel id="review.showAnswer">Show answer</BiLabel>
            </Button>
          ) : (
            <div className="mt-3" data-testid="review-answer">
              <p className="lead mb-1">
                {firstDefinition(word) ?? (
                  <>
                    No definitions available.
                    <HelpLine id="review.noDefinition" />
                  </>
                )}
              </p>
              <SpanishHelp
                key={word.word}
                text={firstDefinition(word) ? `${word.word}: ${firstDefinition(word)}` : word.word}
                term={word.word}
              />
              <details>
                <summary>
                  <BiLabel id="review.allMeanings">All meanings</BiLabel>
                </summary>
                <WordDetails word={word} showHeader={false} />
              </details>
            </div>
          )}
        </Card.Body>
      </Card>
    </section>
  );
}
