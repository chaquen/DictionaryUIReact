import { useEffect } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { READING_GOAL, sentenceWithBlanks } from '../../domain/learningPath';
import { useLearningPath } from '../../context/LearningPathContext';
import { BiLabel, HelpLine } from '../../i18n/Help';

/**
 * Reading goal (US-011): how many of every 100 words of an everyday English
 * text the user knows, against the ~95 that make reading comfortable. The full
 * version adds a sentence with blanks for unknown words and why the number
 * grows fast at first.
 */
export default function CoverageMeter({ compact = false }) {
  const path = useLearningPath();
  const { loadList } = path;

  useEffect(() => {
    loadList();
  }, [loadList]);

  if (path.coverage === null) return null;
  const pct = Math.round(path.coverage * 100);
  const goal = Math.round(READING_GOAL * 100);

  return (
    <div className={compact ? '' : 'mb-3'} data-testid="coverage">
      <div className="small fw-semibold mb-1">
        <BiLabel id="learn.goal" vars={{ pct, goal }}>
          Reading goal: {pct} / {goal} words
        </BiLabel>
      </div>
      <div className="position-relative mb-1">
        <ProgressBar now={pct} max={100} variant="success" aria-label={`You know ${pct} of every 100 words`} />
        <span className="coverage-goal" style={{ left: `${goal}%` }} title={`Goal: ${goal}`} aria-hidden="true" />
      </div>
      <p className="small mb-1">
        You know <strong>{pct}</strong> of every 100 words in a typical English text. At {goal} you can read comfortably.
        <HelpLine id="learn.coverage" vars={{ pct, goal }} />
      </p>
      {!compact && path.covered && (
        <>
          <p className="small mb-1">
            <BiLabel id="learn.sentence">In a typical sentence you would understand:</BiLabel>
          </p>
          <p className="coverage-sentence mb-1" data-testid="coverage-sentence">
            &ldquo;
            {sentenceWithBlanks(path.covered).map((token, i) => (
              <span key={i}>
                {i > 0 && ' '}
                {token.known ? token.text : <span className="coverage-blank" aria-label="unknown word">___</span>}
              </span>
            ))}
            .&rdquo;
          </p>
          <p className="small text-muted mb-0">
            Short words like &ldquo;the&rdquo; and &ldquo;is&rdquo; repeat a lot, so the number grows fast at first.
            <HelpLine id="learn.coverage.why" />
          </p>
        </>
      )}
    </div>
  );
}
