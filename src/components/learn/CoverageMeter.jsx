import { useEffect } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useLearningPath } from '../../context/LearningPathContext';
import { HelpLine } from '../../i18n/Help';

/** "You understand ~X % of everyday English" (US-011). */
export default function CoverageMeter({ compact = false }) {
  const path = useLearningPath();
  const { loadList } = path;

  useEffect(() => {
    loadList();
  }, [loadList]);

  if (path.coverage === null) return null;
  const pct = Math.round(path.coverage * 100);

  return (
    <div className={compact ? '' : 'mb-3'} data-testid="coverage">
      <div className="small mb-1">
        <span>
          Your words cover <strong>{pct} %</strong> of everyday English text
        </span>
        <HelpLine id="learn.coverage" vars={{ pct }} />
      </div>
      <ProgressBar now={pct} max={100} variant="success" aria-label={`Coverage ${pct} percent`} />
    </div>
  );
}
