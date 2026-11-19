import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { firstDefinition, normalizeTerm } from '../../domain/word';
import { GRADES, getStrategy } from '../../domain/scheduling';
import { useLearning } from '../../context/LearningContext';
import { Bi, BiLabel, HelpLine } from '../../i18n/Help';
import SpanishHelp from '../common/SpanishHelp';
import PronounceButton from '../PronounceButton';
import WordDetails from '../WordDetails';

const formatDate = (date) =>
  date.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Spaced-repetition review (#1): recall the meaning, reveal it, grade yourself. */
export default function ReviewPage({ savedWords }) {
  const learning = useLearning();
  const [revealed, setRevealed] = useState(false);
  const [session, setSession] = useState({ reviewed: 0, correct: 0 });
  const [busy, setBusy] = useState(false);
  // Re-check every 30 s so words that become due (e.g. 1 minute after "Again") show up.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const terms = savedWords.words.map((w) => w.word);
  const due = learning.dueCardsNow(terms);
  const card = due[0];
  const word = card && savedWords.words.find((w) => normalizeTerm(w.word) === normalizeTerm(card.term));

  async function grade(value) {
    setBusy(true);
    await learning.rate(card.term, value);
    setSession((s) => ({ reviewed: s.reviewed + 1, correct: s.correct + (value > 1 ? 1 : 0) }));
    setRevealed(false);
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
    const next = learning.nextDue();
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
            <Bi id="review.next" vars={{ date: formatDate(next) }} className="mb-0" helpClassName="mb-0">
              Next review: {formatDate(next)}
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
          {word.phonetic && <p className="text-muted ms-4">{word.phonetic}</p>}

          <Bi id="review.question" className="mt-3 mb-0">
            Do you remember what it means? Rate yourself, or check the answer first.
          </Bi>
          <div className="d-flex flex-wrap gap-2" role="group" aria-label="Rate your answer">
            {GRADES.map((g) => (
              <Button
                key={g.value}
                variant={g.value === 1 ? 'outline-danger' : 'outline-primary'}
                title={g.hint}
                disabled={busy}
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
