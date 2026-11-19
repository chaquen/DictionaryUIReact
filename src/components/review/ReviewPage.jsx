import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { firstDefinition, normalizeTerm } from '../../domain/word';
import { GRADES, getStrategy } from '../../domain/scheduling';
import { useLearning } from '../../context/LearningContext';
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
      </Alert>
    );
  }

  if (!card || !word) {
    const next = learning.nextDue();
    return (
      <section aria-label="Review">
        <Alert variant="success">
          <Alert.Heading as="h2" className="h5">
            All caught up!
          </Alert.Heading>
          {session.reviewed > 0 && (
            <p className="mb-1">
              You reviewed {session.reviewed} {session.reviewed === 1 ? 'word' : 'words'} and remembered {session.correct}.
            </p>
          )}
          <p className="mb-0">{next ? `Next review: ${formatDate(next)}` : 'No reviews scheduled.'}</p>
        </Alert>
      </section>
    );
  }

  const strategy = getStrategy(card.strategy);

  return (
    <section aria-label="Review">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          {due.length} left {session.reviewed > 0 && `· ${session.reviewed} done`}
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

          {!revealed ? (
            <>
              <p className="mt-3">Do you remember what it means?</p>
              <Button onClick={() => setRevealed(true)}>Show answer</Button>
            </>
          ) : (
            <>
              <p className="lead mt-3">{firstDefinition(word) ?? 'No definitions available.'}</p>
              <details className="mb-3">
                <summary>All meanings</summary>
                <WordDetails word={word} showHeader={false} />
              </details>
              <p className="mb-2">How well did you remember it?</p>
              <div className="d-flex flex-wrap gap-2" role="group" aria-label="Rate your answer">
                {GRADES.map((g) => (
                  <Button
                    key={g.value}
                    variant={g.value === 1 ? 'outline-danger' : 'outline-primary'}
                    title={g.hint}
                    disabled={busy}
                    onClick={() => grade(g.value)}
                  >
                    {g.label}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </section>
  );
}
