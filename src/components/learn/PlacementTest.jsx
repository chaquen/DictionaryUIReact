import { useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ProgressBar from 'react-bootstrap/ProgressBar';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { estimateStart, placementSample } from '../../domain/learningPath';
import { Bi, BiLabel } from '../../i18n/Help';

/** Short placement test (FR-014): mark the words you know in each frequency band. */
export default function PlacementTest({ list, onDone }) {
  const sample = useMemo(() => placementSample(list), [list]);
  const [step, setStep] = useState(0);
  const [known, setKnown] = useState(() => new Set());
  const band = sample[step];

  const toggle = (term) =>
    setKnown((current) => {
      const next = new Set(current);
      if (next.has(term)) next.delete(term);
      else next.add(term);
      return next;
    });

  function next() {
    const lastStep = step === sample.length - 1;
    const bandKnown = band.words.filter((w) => known.has(w.term)).length;
    // Stop early when the user knows little of this band: the path starts here.
    if (lastStep || bandKnown / band.words.length < 0.6) {
      const knownTerms = [...known];
      onDone(estimateStart(sample.slice(0, step + 1), known), knownTerms);
    } else {
      setStep(step + 1);
    }
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Bi id="placement.title" as="h2" className="h4 card-title mb-1" helpClassName="mb-3">
          Which of these words do you know?
        </Bi>
        <Bi
          id="placement.instructions"
          vars={{ step: step + 1, total: sample.length }}
          className="text-muted mb-1"
          helpClassName="mb-3"
        >
          Tap the words whose meaning you know. This finds where your path should start ({step + 1} of {sample.length}).
        </Bi>
        <ProgressBar now={step + 1} max={sample.length} className="mb-3" aria-label="Placement progress" />
        <div className="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Words to mark as known">
          {band.words.map((w) => (
            <ToggleButton
              key={w.term}
              id={`placement-${w.term}`}
              type="checkbox"
              variant={known.has(w.term) ? 'success' : 'outline-secondary'}
              checked={known.has(w.term)}
              value={w.term}
              onChange={() => toggle(w.term)}
            >
              {w.term}
            </ToggleButton>
          ))}
        </div>
        <div className="d-flex gap-2">
          <Button onClick={next}>
            <BiLabel id="placement.next">Next</BiLabel>
          </Button>
          <Button variant="link" onClick={() => onDone(sample[0].from, [...known])}>
            <BiLabel id="placement.skip">Skip: start with the most common words</BiLabel>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
